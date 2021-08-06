import { BytesConverterPipe } from './bytes-converter.pipe';

describe('BytesConverterPipe', () => {
  it('create an instance', () => {
    const pipe = new BytesConverterPipe();
    expect(pipe).toBeTruthy();
  });
});
