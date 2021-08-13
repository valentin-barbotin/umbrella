import {Pipe, PipeTransform} from '@angular/core';
import bytes from 'bytes';

@Pipe({
    name: 'bytesConverter'
})

export class BytesConverterPipe implements PipeTransform {

    /**
     * Generate a human readable string from bytes
     * @param {number} value
     * @returns {string}
     */
    transform(value: number): string {
        return bytes(value, {
            unitSeparator: ' '
        });
    }
}
