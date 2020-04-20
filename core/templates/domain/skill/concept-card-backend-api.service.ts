// Copyright 2018 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Service to retrieve read only information
 * about the concept card of a skill from the backend.
 */

import { downgradeInjectable } from '@angular/upgrade/static';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { UrlInterpolationService } from
  'domain/utilities/url-interpolation.service';
import { SkillDomainConstants } from
  'domain/skill/skill-domain.constants';

@Injectable({
  providedIn: 'root'
})

export class ConceptCardBackendApiService {
  // Maps previously loaded concept cards to their IDs.
  _conceptCardCache: Object = {};

  constructor(
    private urlInterpolationService: UrlInterpolationService,
    private http: HttpClient
  ) { }

  _fetchConceptCards(skillIds: Array<string>,
      successCallback: (value?: Object | PromiseLike<Object>) => void,
      errorCallback: (reason?: any) => void): void {
    let conceptCardDataUrl = this.urlInterpolationService.interpolateUrl(
      SkillDomainConstants.CONCEPT_CARD_DATA_URL_TEMPLATE, {
        comma_separated_skill_ids: skillIds.join(',')
      });

    this.http.get(conceptCardDataUrl).toPromise().then((response: any) => {
      let conceptCards = angular.copy(response.data.concept_card_dicts);

      if (successCallback) {
        successCallback(conceptCards);
      }
    }, (error: any) => {
      if (errorCallback) {
        errorCallback(error);
      }
    });
  }

  _isCached(skillId: string): any {
    return this._conceptCardCache.hasOwnProperty(skillId);
  }

  _getUncachedSkillIds(skillIds: Array<string>): any {
    let uncachedSkillIds = [];
    skillIds.forEach(function(skillId) {
      if (!this._isCached(skillId)) {
        uncachedSkillIds.push(skillId);
      }
    });
    return uncachedSkillIds;
  }

  loadConceptCards(skillIds: Array<string>): Promise<Object> {
    return new Promise((resolve, reject) => {
      let uncachedSkillIds = this._getUncachedSkillIds(skillIds);
      let conceptCards = [];
      if (uncachedSkillIds.length !== 0) {
        // Case where only part (or none) of the concept cards are cached
        // locally.
        this._fetchConceptCards(
          uncachedSkillIds, function(uncachedConceptCards) {
            skillIds.forEach(function(skillId) {
              if (uncachedSkillIds.includes(skillId)) {
                conceptCards.push(
                  uncachedConceptCards[uncachedSkillIds.indexOf(skillId)]);
                // Save the fetched conceptCards to avoid future fetches.
                this._conceptCardCache[skillId] = angular.copy(
                  uncachedConceptCards[uncachedSkillIds.indexOf(skillId)]);
              } else {
                conceptCards.push(
                  angular.copy(this._conceptCardCache[skillId]));
              }
            });
            if (resolve) {
              resolve(angular.copy(conceptCards));
            }
          }, reject);
      } else {
        // Case where all of the concept cards are cached locally.
        skillIds.forEach(function(skillId) {
          conceptCards.push(angular.copy(this._conceptCardCache[skillId]));
        });
        if (resolve) {
          resolve(conceptCards);
        }
      }
    });
  }
}

angular.module('oppia').factory(
  'ConceptCardBackendApiService',
  downgradeInjectable(ConceptCardBackendApiService));
