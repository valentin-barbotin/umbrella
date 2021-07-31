import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'bytesConverter'
})
export class BytesConverterPipe implements PipeTransform {
  transform (value: number, ...args: any[]): any {
    if (!value) return ''
    if (args.length === 1) {
      let origin: string | number = value
      let withKb = false

      if (origin >= 1000) {
        origin = (origin /= 1024).toFixed(2)
        withKb = true
      }

      switch (args[0]) {
        case 'MB':
          value /= 1e6
          break
        case 'KB':
          value /= 1e2
          break

        default:
          break
      }
      const ret = value.toFixed(2)
      return ret === '0.00' ? `${origin} ${withKb ? 'KB' : 'B'}` : `${ret} ${args[0]}`
    }
    return value
  }
}
