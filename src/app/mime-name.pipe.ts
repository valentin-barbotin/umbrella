import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mimeName'
})
export class MimeNamePipe implements PipeTransform {

  transform(value: string, ...args: any[]): unknown {
    switch (value) {
      case 'application/x-msdownload':
        value = 'Executable file'
        break;
    
      default:
        // value = 'Unknown'
        break;
    }
    return value;
  }

}
