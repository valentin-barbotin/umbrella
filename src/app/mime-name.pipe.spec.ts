import { MimeNamePipe } from './mime-name.pipe';

describe('MimeNamePipe', () => {
  it('create an instance', () => {
    const pipe = new MimeNamePipe();
    expect(pipe).toBeTruthy();
  });
});
