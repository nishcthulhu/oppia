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
 * @fileoverview Unit tests for ConceptCardBackendApiService.
 */

import { HttpClientTestingModule, HttpTestingController } from
  '@angular/common/http/testing';
import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing'; 

import { ConceptCardBackendApiService } from
  'domain/skill/concept-card-backend-api.service.ts';

describe('Concept card backend API service', () => {
  let conceptCardBackendApiService: ConceptCardBackendApiService = null;
  let httpTestingController: HttpTestingController;
  let sampleResponse1 = null;
  let sampleResponse2 = null;
  let sampleResponse3 = null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
  httpTestingController = TestBed.get(HttpTestingController);
  conceptCardBackendApiService = TestBed.get(ConceptCardBackendApiService);

    var example1 = {
      question: {
        html: 'worked example question 1',
        content_id: 'worked_example_q_1'
      },
      explanation: {
        html: 'worked example explanation 1',
        content_id: 'worked_example_e_1'
      }
    };
    var example2 = {
      question: {
        html: 'worked example question 2',
        content_id: 'worked_example_q_2'
      },
      explanation: {
        html: 'worked example explanation 2',
        content_id: 'worked_example_e_2'
      }
    };
    var example3 = {
      question: {
        html: 'worked example question 3',
        content_id: 'worked_example_q_3'
      },
      explanation: {
        html: 'worked example explanation 3',
        content_id: 'worked_example_e_3'
      }
    };
    var example4 = {
      question: {
        html: 'worked example question 4',
        content_id: 'worked_example_q_4'
      },
      explanation: {
        html: 'worked example explanation 4',
        content_id: 'worked_example_e_4'
      }
    };
    var conceptCardDict1 = {
      explanation: {
        html: 'test explanation 1',
        content_id: 'explanation_1'
      },
      worked_examples: [example1, example2],
      recorded_voiceovers: {
        voiceovers_mapping: {
          explanation: {},
          worked_example_q_1: {},
          worked_example_e_1: {},
          worked_example_q_2: {},
          worked_example_e_2: {}
        }
      }
    };

    var conceptCardDict2 = {
      explanation: {
        html: 'test explanation 2',
        content_id: 'explanation_2'
      },
      worked_examples: [example3, example4],
      recorded_voiceovers: {
        voiceovers_mapping: {
          explanation: {},
          worked_example_q_3: {},
          worked_example_e_3: {},
          worked_example_q_4: {},
          worked_example_e_4: {}
        }
      }
    };

    sampleResponse1 = {
      concept_card_dicts: [conceptCardDict1]
    };

    sampleResponse2 = {
      concept_card_dicts: [conceptCardDict2]
    };

    sampleResponse3 = {
      concept_card_dicts: [conceptCardDict1, conceptCardDict2]
    };
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should successfully fetch a concept card from the backend',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      conceptCardBackendApiService.loadConceptCards(['1']).then(
        successHandler, failHandler);

      let req = httpTestingController.expectOne(
        '/concept_card_handler/1');
      expect(req.request.method).toEqual('GET');
      req.flush(sampleResponse1);
      flushMicrotasks();  

      expect(successHandler).toHaveBeenCalledWith(sampleResponse1.concept_card_dicts);
      expect(failHandler).not.toHaveBeenCalled();
    }));

  it('should succesfully fetch multiple concept cards from the backend',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      let conceptCardDataUrl =
        '/concept_card_handler/' + encodeURIComponent('1,2');

      conceptCardBackendApiService.loadConceptCards(['1', '2']).then(
        successHandler, failHandler);

      let req = httpTestingController.expectOne(conceptCardDataUrl);
      expect(req.request.method).toEqual('GET');
      req.flush(sampleResponse3);
      flushMicrotasks();  

      expect(successHandler).toHaveBeenCalledWith(
        sampleResponse3.concept_card_dicts);
      expect(failHandler).not.toHaveBeenCalled();
    }));

  it('should get all concept cards even the one which was fetched before',
    fakeAsync(() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      let successHandler2 = jasmine.createSpy('success');
      let failHandler2 = jasmine.createSpy('fail');

      conceptCardBackendApiService.loadConceptCards(['1']).then(
        successHandler, failHandler);

      let req = httpTestingController.expectOne(
        '/concept_card_handler/1');
      expect(req.request.method).toEqual('GET');
      req.flush(sampleResponse1);
      flushMicrotasks();  

      conceptCardBackendApiService.loadConceptCards(['1', '2']).then(
        successHandler2, failHandler2);

      let req2 = httpTestingController.expectOne(
        '/concept_card_handler/2');
      expect(req.request.method).toEqual('GET');
      req2.flush(sampleResponse2);
      flushMicrotasks();  

      expect(successHandler).toHaveBeenCalledWith(
        sampleResponse1.concept_card_dicts);
      expect(successHandler2).toHaveBeenCalledWith(
        sampleResponse3.concept_card_dicts);
    }));

  it('should use the rejection handler if backend request failed',
    fakeAsync (() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      conceptCardBackendApiService.loadConceptCards(['1']).then(
        successHandler, failHandler);

      let req = httpTestingController.expectOne(
        '/concept_card_handler/1');
      expect(req.request.method).toEqual('GET');
      req.flush('Error loading skill 1.', {
            status: 500,
            statusText: 'Error loading skill 1.'
          });
      flushMicrotasks();

      expect(successHandler).not.toHaveBeenCalled();
      expect(failHandler).toHaveBeenCalledWith('Error loading skill 1.');
    }));

  it('should not fetch the same concept card', 
    fakeAsync (() => {
      let successHandler = jasmine.createSpy('success');
      let failHandler = jasmine.createSpy('fail');

      let successHandler2 = jasmine.createSpy('success');
      let failHandler2 = jasmine.createSpy('fail');

      //load collection to cache
      conceptCardBackendApiService.loadConceptCards(['1']).then(
        successHandler, failHandler);

      let req = httpTestingController.expectOne(
        '/concept_card_handler/1');      
      expect(req.request.method).toEqual('GET');
      req.flush(sampleResponse1);
      flushMicrotasks();

      //Reload from cache without an http flush
      conceptCardBackendApiService.loadConceptCards(['1']).then(
        successHandler2, failHandler2);

      expect(successHandler).toHaveBeenCalledWith(
        sampleResponse1.concept_card_dicts);
      expect(failHandler).not.toHaveBeenCalled();
  }));
});
