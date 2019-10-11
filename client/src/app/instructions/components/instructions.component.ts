// Angular
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
// App
import { AppConfig } from '@gcv/app.config';
import { TourService } from '@gcv/core/services';
import { elementIsVisible } from '@gcv/core/utils';

declare var $: any;
declare var scrollToSelector: any;  // src/assets/js/utils

@Component({
  selector: 'instructions',
  styleUrls: [ './instructions.component.scss' ],
  templateUrl: './instructions.component.html',
})
export class InstructionsComponent implements AfterViewInit, OnDestroy {

  @ViewChild('searchScreenshot', {static: true}) searchScreenshotEl: ElementRef;
  @ViewChild('multiScreenshot', {static: true}) multiScreenshotEl: ElementRef;

  brand = AppConfig.BRAND;
  dashboard = AppConfig.DASHBOARD;
  copyrightYear = (new Date()).getFullYear();

  private searchPopover = false;
  private multiPopover = false;

  constructor(private tourService: TourService) { }

  ngAfterViewInit() {
    // create popovers
    $(this.searchScreenshotEl.nativeElement).popover({
      content: this.dashboard.search.caption,
      html: true,
    });
    $(this.multiScreenshotEl.nativeElement).popover({
      content: this.dashboard.multi.caption,
      html: true,
      placement: 'left',
    });
    // show popovers on scroll
    $(document).on('scroll', () => {
      if (elementIsVisible(this.searchScreenshotEl.nativeElement, true) && !this.searchPopover) {
        this.searchPopover = true;
        $(this.searchScreenshotEl.nativeElement).trigger('click');
      }
      if (elementIsVisible(this.multiScreenshotEl.nativeElement, true) && !this.multiPopover) {
        this.multiPopover = true;
        $(this.multiScreenshotEl.nativeElement).trigger('click');
      }
    });
  }

  ngOnDestroy() {
    $(this.searchScreenshotEl.nativeElement).popover('dispose');
    $(this.multiScreenshotEl.nativeElement).popover('dispose');
  }

  scrollTo(event, selector): void {
    event.preventDefault();
    scrollToSelector('html, body', selector);
  }

  startTour(event): void {
    event.preventDefault();
    this.tourService.startTour('defaultTour');
  }
}
