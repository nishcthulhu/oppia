// Copyright 2014 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Service for recommending explorations at the end of an
 * exploration.
 */

import { downgradeInjectable } from '@angular/upgrade/static';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ContextService } from 'services/context.service';
import { UrlService } from 'services/contextual/url.service';
import { ServicesConstants } from 'services/services.constants';

@Injectable({
  providedIn: 'root'
})

export class ExplorationRecommendationsService {
  isIframed: any = this.urlService.isIframed();
  isInEditorPage: boolean = (this.contextService.getPageContext() ===
    ServicesConstants.PAGE_CONTEXT.EXPLORATION_EDITOR);
  isInEditorPreviewMode: boolean = this.isInEditorPage && (
    this.contextService.getEditorTabContext() ===
    ServicesConstants.EXPLORATION_EDITOR_TAB_CONTEXT.PREVIEW);
  explorationId: any = this.contextService.getExplorationId();

  constructor(
    private http: HttpClient,
    private contextService: ContextService,
    private urlService: UrlService,
  ) { }

  getRecommendedSummaryDicts(authorRecommendedExpIds: Array<any>,
      includeAutogeneratedRecommendations: boolean, successCallback: Function): void {
    let recommendationsUrlParams = {
      stringified_author_recommended_ids: JSON.stringify(
        authorRecommendedExpIds),
      collection_id: this.urlService.getCollectionIdFromExplorationUrl(),
      story_id: this.urlService.getUrlParams().story_id,
      current_node_id: this.urlService.getUrlParams().node_id,
      include_system_recommendations: null
    };

    if (includeAutogeneratedRecommendations && !this.isInEditorPage) {
      recommendationsUrlParams.include_system_recommendations = 'true';
    }

    this.http.get('/explorehandler/recommendations/' + this.explorationId,
      {
        observe: 'response',
        params: recommendationsUrlParams
      }).toPromise().then((response: any) => {
      if (successCallback) {
        successCallback(response.body.summaries);
      }
    });
  }
}

angular.module('oppia').factory(
  'ExplorationRecommendationsService',
  downgradeInjectable(ExplorationRecommendationsService));
