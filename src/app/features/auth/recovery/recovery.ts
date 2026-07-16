import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiLink } from '@taiga-ui/core';

@Component({
  selector: 'app-recovery',
  imports: [RouterLink, TuiButton, TuiLink],
  templateUrl: './recovery.html',
  styleUrl: './recovery.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Recovery {}
