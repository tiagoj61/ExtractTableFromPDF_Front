import { TestBed } from '@angular/core/testing';

import { RazaoSocialService } from './razao-social.service';

describe('RazaoSocialService', () => {
  let service: RazaoSocialService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RazaoSocialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
