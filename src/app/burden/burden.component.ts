import { Component, Input, OnInit } from '@angular/core';

import { SelectionModel } from '@angular/cdk/collections';
import { Burden } from '@app/_models/burden';


@Component({
  selector: 'app-burden',
  templateUrl: './burden.component.html',
  styleUrls: ['./burden.component.css']
})
export class BurdenComponent {
  @Input() burdens: Burden[] = [];
	@Input()
  displayedColumns!: string[];
	@Input()
  selection!: SelectionModel<Burden>[];
	@Input()
  index!: number;

	constructor() {}


}