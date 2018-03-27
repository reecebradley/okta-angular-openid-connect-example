/* tslint:disable:no-unused-variable */
import { TestBed, inject, tick, fakeAsync, async } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { SearchService } from './search.service';
import { BaseRequestOptions, Http, ConnectionBackend, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('SearchService', () => {
  let searchService: SearchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [ SearchService,
        {
          provide: Http, useFactory: (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backend, defaultOptions);
          }, deps: [ MockBackend, BaseRequestOptions ]
        },
        { provide: MockBackend, useClass: MockBackend },
        { provide: BaseRequestOptions, useClass: BaseRequestOptions }
      ]
    });
    searchService = TestBed.get(SearchService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should retrieve all search results', (done) => {
    searchService.getAll().subscribe(res => {
      expect(res).toEqual(
        [ { "name": "John Elway" }, { "name": "Gary Kubiak" } ]
      );
      done();
    });
    let countryRequest = httpMock.expectOne('assets/data/people.json');
    countryRequest.flush([ { "name": "John Elway" }, { "name": "Gary Kubiak" } ]);
    httpMock.verify();
  });

  it('should filter by search term',
    inject([ SearchService, MockBackend ], fakeAsync((searchService: SearchService, mockBackend: MockBackend) => {
      let res;
      mockBackend.connections.subscribe(c => {
        expect(c.request.url).toBe('assets/data/people.json');
        const response = new ResponseOptions({ body: '[{"name": "John Elway"}, {"name": "Gary Kubiak"}]' });
        c.mockRespond(new Response(response));
      });
      searchService.search('john').subscribe((response) => {
        res = response;
      });
      tick();
      expect(res[ 0 ].name).toBe('John Elway');
    }))
  );

  it('should fetch by id',
    inject([ SearchService, MockBackend ], fakeAsync((searchService: SearchService, mockBackend: MockBackend) => {
      let res;
      mockBackend.connections.subscribe(c => {
        expect(c.request.url).toBe('assets/data/people.json');
        const response = new ResponseOptions({ body: '[{"id": 1, "name": "John Elway"}, {"id": 2, "name": "Gary Kubiak"}]' });
        c.mockRespond(new Response(response));
      });
      searchService.search('2').subscribe((response) => {
        res = response;
      });
      tick();
      expect(res[ 0 ].name).toBe('Gary Kubiak');
    }))
  );
});
