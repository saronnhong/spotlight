import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlignmentFrameworkComponent } from './alignment-framework.component';

describe('AlignmentFrameworkComponent', () => {
  let component: AlignmentFrameworkComponent;
  let fixture: ComponentFixture<AlignmentFrameworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlignmentFrameworkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlignmentFrameworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
