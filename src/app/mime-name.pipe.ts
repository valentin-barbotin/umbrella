import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'mimeName'
})
export class MimeNamePipe implements PipeTransform {
  transform (value: string, ...args: any[]): unknown {
    if (args.length !== 1) return value

    const dict: { [k: string]: string} = {
      'application/x-msdownload': 'Executable file',
      'image/jpeg': 'Image JPEG'
    }

    value = dict[value]
    if (value) {
      return value
    }

    const tmp = args.shift().split('.').pop() as string
    return `${tmp.toUpperCase() ?? 'Unknown'} file`
  }
}
