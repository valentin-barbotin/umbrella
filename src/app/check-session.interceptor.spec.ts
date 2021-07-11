import { TestBed } from '@angular/core/testing';

import { CheckSessionInterceptor } from './check-session.interceptor';

describe('CheckSessionInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      CheckSessionInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: CheckSessionInterceptor = TestBed.inject(CheckSessionInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
