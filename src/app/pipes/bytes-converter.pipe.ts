import { Pipe, PipeTransform } from '@angular/core'
import bytes from 'bytes'

@Pipe({
  name: 'bytesConverter'
})
export class BytesConverterPipe implements PipeTransform {
  transform (value: number, ...args: any[]): any {
    if (!value) return ''
    return bytes(value, {
      unitSeparator: ' '
    })
  }
}