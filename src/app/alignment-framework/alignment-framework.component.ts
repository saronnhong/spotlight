

import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from "rxjs/operators";
// import { environment } from '@environments/environment';
import * as d3 from 'd3';
// @ts-ignore
import d3Tip from 'd3-tip';
// import { NotificationService } from '@core/core.module';
import html2canvas from 'html2canvas';
import { forkJoin } from 'rxjs';

interface ScatterDataNormailization {
  xValue: number;
  yValue: number;
  totalCounts: number;
}
interface ScatterDataCluster {
  xValue: number;
  yValue: number;
  clusterid: string
}

@Component({
  selector: 'app-alignment-framework',
  templateUrl: './alignment-framework.component.html',
  styleUrls: ['./alignment-framework.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AlignmentFrameworkComponent implements OnInit {
  // @Input() outputs;
  outputs: any;
  // private readonly API_URL = environment.apiUrl;
  API_URL = ''

  containerId: string = '#scatter';
  minimapContainerId: string = '#minimapId'

  isLoading: boolean = false;

  scatterPlotData: ScatterDataNormailization[] = [];
  scatterPlotDataCluster: ScatterDataCluster[] = [];

  dataDict: Record<string, any> = {}

  xMin: number = 100000000
  xMax: number = 0
  yMin: number = 100000000
  yMax: number = 0
  totalCountsMax: number = 0;
  totalCountsMin: number = 100000000;

  totalCounts: Record<string, any> = {}

  scaleFactor: number = 0.01602821;
  geneSearch: string = 'VIM'

  selectedColor: string = 'Green';
  colors: string[] = ['Red', 'Green']

  plotOpacityValue: number = .7
  imageOpacityValue: number = .5

  overlayImage: boolean = false;
  displayPlot: boolean = false;
  displayImage: boolean = false;

  displayAlignment: boolean = false;

  // scaleFactorVal = '0.01602821';
  scaleFactorVal: string = '0';
  geneSearchVal: string = 'VIM'

  moveAmount: number = 1;

  plotWidth: number = 300;
  plotHeight: number = 500;

  currentLeft: number = 0;
  currentTop: number = 0;

  widthAdjustment: number = 0
  heightAdjustment: number = 0

  droppedFile: File | null = null;
  droppedFileURL: string | ArrayBuffer | null = null;

  imageAdjustedWidth: number = 0;
  maxImageContainerWidthOverylay: number = this.plotWidth;
  maxImageContainerWidthSidebySide: number = this.plotWidth * 2;

  currentZoomScaleFactor: number = 1;
  maxScaleFactor: number = 2;
  minScaleFactor: number = 0.5;

  useCluster: boolean = false;
  useNormalization: boolean = false;

  legendWidth: number = 120;

  clusterTypes: Record<string, any> = {}
  clusterColors: string[] = ["#EBCD00", "#52A52E", "#00979D", "#6578B4", "#80408D", "#C9006B", "#68666F", "#E80538", "#E87D1E"]

  selectionRectStyle: Record<string, any> = {};

  geneSearchHeight: number = 100;

  analysisType: string = ''

  xAxisValue: string = '';
  yAxisValue: string = ''
  xAxisValueList: string[] = []
  yAxisValueList: string[] = []

  panelOpenState: boolean = true;

  currentDegree: number = 0;
  scaleXCustom: number = 1;

  showMiniMap = false;

  zoomMin: number = 0.5;
  zoomMax: number = 5;

  originalPlotWidth: number = 0;
  originalPlotHeight: number = 0;
  displayOverlayContainer: boolean = true;

  scales: Record<string, number[]> = {
    "0.5": [0, 0],
    "1": [0, 0],
    "2": [50, 150],
    "3": [200, 400],
    "4": [400, 800],
    "5": [800, 1200]
  }
  currentImageLeft: number = 0;
  currentImageTop: number = 0;
  sliderLeft: number = 0;
  sliderTop: number = 0;

  xAxisFlipped: boolean = false;
  yAxisFlipped: boolean = false;
  axisSwapped: boolean = false;

  constructor(
    private http: HttpClient,
    // private readonly notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    this.getDataSpotlight()
  }

  resetVariables() {
    this.scatterPlotData = [];
    this.xMin = 100000000
    this.xMax = 0
    this.yMin = 100000000
    this.yMax = 0
    this.totalCountsMax = 0;
    this.totalCountsMin = 100000000;

    this.dataDict = {}
    this.plotWidth = 300;
    this.plotHeight = 500;
    this.originalPlotWidth = 0;
    this.originalPlotHeight = 0;

    this.currentZoomScaleFactor = 1;
    this.scaleXCustom = 1;

    this.currentImageLeft = 0
    this.currentImageTop = 0
    this.sliderLeft = 0
    this.sliderTop = 0
    this.overlayImage = false;
    this.displayAlignment = false;
    this.axisSwapped = false
    this.xAxisFlipped = false;
    this.yAxisFlipped = false;
    this.showMiniMap = false;

    const imageContainer = document.querySelector('.imageContainer') as HTMLImageElement;
    const imageContainer2 = document.querySelector('.imageContainer2') as HTMLImageElement;
    const plotContainer = document.querySelector('.plotContainer') as HTMLImageElement;

    const miniBoxContainer = document.querySelector('.miniboxDiv') as HTMLImageElement;
    const minimapImageContainer = document.querySelector('.miniMapImageContainer') as HTMLImageElement;
    const minimapPlotContainer = document.querySelector('.minimapPlotContainer') as HTMLImageElement;

    let transformImageValue = `translateX(${0}px) translateY(${0}px) scaleX(${1}) scaleY(${1}) rotate(${0}deg)`;
    let transformMiniMapValue = `translateX(${0}px) translateY(${0}px) scaleX(${1}) scaleY(${1}) rotate(${0}deg)`;
    let transformBox = `translateX(${0}px) translateY(${0}px) scaleX(${1}) scaleY(${1})`;

    if (imageContainer) {
      imageContainer.style.transform = transformImageValue;
      imageContainer2.style.transform = transformImageValue;
    }

    if (plotContainer) {
      plotContainer.style.transform = transformImageValue;
    }

    if (minimapPlotContainer) {
      miniBoxContainer.style.transform = transformBox;
      minimapImageContainer.style.transform = transformMiniMapValue;
      minimapPlotContainer.style.transform = transformMiniMapValue;
    }

  }

  setScaleFactor(event: Event) {
    event.preventDefault();
    this.scaleFactor = parseFloat(this.scaleFactorVal)
    this.createScatterPlot('normal')
    this.createScatterPlot('minimap')
  }

  onColorChange() {
    this.createScatterPlot('normal')
    this.createScatterPlot('minimap')
  }

  updatePlotOpacity(value: number): void {
    this.plotOpacityValue = value;
  }

  updateImageOpacity(value: number): void {
    this.imageOpacityValue = value;
  }

  scrollTo(htmlID: any) {
    const element = document.getElementById(htmlID) as HTMLElement;
    element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
  }

  getAxisColumnNames() {
    // this.isLoading = true;
    // let coords_metadata_uuid = this.outputs["coords_metadata"]
    // this.httpClient.get(`${this.API_URL}/resources/${coords_metadata_uuid}/contents/?page=1&page_size=1`).pipe(
    //   catchError(error => {
    //     this.isLoading = false;
    //     // this.notificationService.error(`Error ${error.status}: Error from coordinates metadata request.`);
    //     console.log("some error from coord: ", error)
    //     throw error;
    //   })
    // ).subscribe(res => {
    //   this.isLoading = false;
    //   let jsonObj = res['results'][0]['values']
    //   const keys = Object.keys(jsonObj);
    //   this.xAxisValueList = keys;
    //   this.yAxisValueList = keys;
    // })
  }

  getDataNormalization() {
    // this.showMiniMap = true;
    // this.geneSearch = this.geneSearchVal.split('').map(letter => letter.toUpperCase()).join('');
    // this.geneSearchHeight = 100;
    // this.useNormalization = true;
    // this.isLoading = true;
    // this.panelOpenState = false;
    // this.scrollTo('topOfPage');
    // this.resetVariables();
    // let normalization_uuid = this.outputs["normalized_expression"];
    // let coords_metadata_uuid = this.outputs["coords_metadata"];

    // const normRequest = this.httpClient.get(`${this.API_URL}/resources/${normalization_uuid}/contents/?__rowname__=[eq]:${this.geneSearch}`).pipe(
    //   catchError(error => {
    //     this.isLoading = false;
    //     // this.notificationService.error(`Error ${error.status}: Error from normalized expression request.`);
    //     console.log("some error message from norm: ", error)
    //     throw error;
    //   })
    // );

    // const coordsMetadataRequest = this.httpClient.get(`${this.API_URL}/resources/${coords_metadata_uuid}/contents/`).pipe(
    //   catchError(error => {
    //     this.isLoading = false;
    //     // this.notificationService.error(`Error ${error.status}: Error from coordinates metadata request.`);
    //     console.log("some error from coord: ", error)
    //     throw error;
    //   })
    // );

    // forkJoin([normRequest, coordsMetadataRequest]).subscribe(([normRes, coordsMetadataRes]) => {
    //   this.isLoading = false;
    //   if (Array.isArray(normRes) && normRes.length > 0 && normRes[0].hasOwnProperty('values')) {
    //     for (let i in normRes[0]['values']) {
    //       let key = i;
    //       let count = normRes[0]['values'][i];
    //       this.dataDict[key] = {
    //         ...this.dataDict[key],
    //         count
    //       };
    //     }

    //     for (let i in coordsMetadataRes) {
    //       let obj = coordsMetadataRes[i];
    //       let key = obj['rowname'];
    //       let xVal = obj['values'][this.xAxisValue];
    //       let yVal = obj['values'][this.yAxisValue];

    //       this.dataDict[key] = {
    //         ...this.dataDict[key],
    //         xVal,
    //         yVal
    //       };
    //     }

    //     for (let i in this.dataDict) {
    //       const parsedX = parseInt(this.dataDict[i]['xVal'])
    //       const parsedY = parseInt(this.dataDict[i]['yVal'])
    //       const totalCounts = parseFloat(parseFloat(this.dataDict[i]['count']).toFixed(3));

    //       if (this.dataDict[i]['xVal'] !== undefined && this.dataDict[i]['yVal'] !== undefined && this.dataDict[i]['count'] !== undefined && !isNaN(parsedX) && !isNaN(parsedY) && !isNaN(totalCounts)) {
    //         let temp = {
    //           "xValue": parsedX,
    //           "yValue": parsedY,
    //           "totalCounts": totalCounts
    //         }
    //         let keyName = parsedX + "_" + parsedY
    //         this.totalCounts[keyName] = totalCounts
    //         this.scatterPlotData.push(temp)

    //         this.xMin = Math.min(this.xMin, parsedX);
    //         this.xMax = Math.max(this.xMax, parsedX);

    //         this.yMin = Math.min(this.yMin, parsedY);
    //         this.yMax = Math.max(this.yMax, parsedY);

    //         this.totalCountsMax = Math.max(this.totalCountsMax, totalCounts)
    //         this.totalCountsMin = Math.min(this.totalCountsMin, totalCounts)
    //       }
    //     }
    //     let normalizePlot = (this.xMax - this.xMin) / 300 // This will set the plot to a width of 300px
    //     this.plotWidth = (this.xMax - this.xMin) / normalizePlot;
    //     this.plotHeight = (this.yMax - this.yMin) / normalizePlot;

    //     if (this.originalPlotWidth === 0) {
    //       this.originalPlotWidth = this.plotWidth;
    //       this.originalPlotHeight = this.plotHeight;
    //     }

    //     this.selectionRectStyle = {
    //       top: `${0}px`,
    //       width: `${this.originalPlotWidth / 4}px`,
    //       height: `${this.originalPlotHeight / 4}px`,
    //       border: '2px solid #1DA1F2',
    //       position: 'absolute',
    //     };

    //     if (this.scatterPlotData.length > 0) {
    //       this.displayOverlayContainer = true;
    //       this.createScatterPlot('normal')
    //       this.createScatterPlot('minimap')
    //     }

    //   }

    //   else {
    //     this.displayOverlayContainer = false;
    //   }
    // });
  }

  getDataClusters() {
    // this.showMiniMap = true;
    // this.geneSearchHeight = 0;
    // this.useCluster = true;
    // this.isLoading = true;
    // this.panelOpenState = false;
    // this.scrollTo('topOfPage')
    // this.resetVariables();
    // let clusters_uuid = this.outputs["clustered_positions"];
    // let coords_metadata_uuid = this.outputs["coords_metadata"]

    // const clusterRequest = this.httpClient.get(`${this.API_URL}/resources/${clusters_uuid}/contents/`).pipe(
    //   catchError(error => {
    //     this.isLoading = false;
    //     // this.notificationService.error(`Error ${error.status}: Error from normalized expression request.`);
    //     throw error;
    //   })
    // );

    // const coordsMetadataRequest = this.httpClient.get(`${this.API_URL}/resources/${coords_metadata_uuid}/contents/`).pipe(
    //   catchError(error => {
    //     this.isLoading = false;
    //     // this.notificationService.error(`Error ${error.status}: Error from coordinates metadata request.`);
    //     throw error;
    //   })
    // );

    // forkJoin([clusterRequest, coordsMetadataRequest]).subscribe(([clusterRes, coordsMetadataRes]) => {
    //   this.isLoading = false;
    //   if (Array.isArray(clusterRes) && clusterRes.length > 0 && clusterRes[0].hasOwnProperty('rowname') && clusterRes[0].hasOwnProperty('values')) {
    //     for (let index in clusterRes) {
    //       let key = clusterRes[index]['rowname']
    //       let clusterid = clusterRes[index]['values']['clusterid']
    //       this.dataDict[key] = {
    //         ...this.dataDict[key],
    //         clusterid
    //       };
    //     }

    //     for (let i in coordsMetadataRes) {
    //       let obj = coordsMetadataRes[i];
    //       let key = obj['rowname'];
    //       let xVal = obj['values'][this.xAxisValue]
    //       let yVal = obj['values'][this.yAxisValue]
    //       this.dataDict[key] = {
    //         ...this.dataDict[key],
    //         xVal,
    //         yVal
    //       };
    //     }

    //     let colorLabels = {}

    //     for (let i in this.dataDict) {
    //       const parsedX = parseInt(this.dataDict[i]['xVal'])
    //       const parsedY = parseInt(this.dataDict[i]['yVal'])
    //       const clusterid = this.dataDict[i]['clusterid']

    //       if (!isNaN(parsedX) && !isNaN(parsedY) && clusterid) {
    //         let clusterName = "Cluster " + clusterid
    //         let temp = {
    //           "xValue": parsedX,
    //           "yValue": parsedY,
    //           "clusterid": clusterid
    //         }
    //         //this allows for the colors to be repeated 
    //         let clusterNumber = parseInt(clusterid)
    //         if (!colorLabels[clusterNumber]) {
    //           colorLabels[clusterNumber] = 1;
    //           let remainder = clusterNumber % this.clusterColors.length;
    //           let colorObj = {
    //             "label": clusterName,
    //             "color": remainder === 0 ? this.clusterColors[this.clusterColors.length - 1] : this.clusterColors[remainder - 1]
    //           }
    //           this.clusterTypes[clusterName] = colorObj
    //         }

    //         this.scatterPlotDataCluster.push(temp)

    //         this.xMin = Math.min(this.xMin, parsedX);
    //         this.xMax = Math.max(this.xMax, parsedX);

    //         this.yMin = Math.min(this.yMin, parsedY);
    //         this.yMax = Math.max(this.yMax, parsedY);
    //       }
    //     }

    //     let normalizePlot = (this.xMax - this.xMin) / 300 // This will set the plot to a width of 300px
    //     this.plotWidth = (this.xMax - this.xMin) / normalizePlot;
    //     this.plotHeight = (this.yMax - this.yMin) / normalizePlot;

    //     if (this.originalPlotWidth === 0) {
    //       this.originalPlotWidth = this.plotWidth;
    //       this.originalPlotHeight = this.plotHeight;
    //     }

    //     this.selectionRectStyle = {
    //       top: `${0}px`,
    //       width: `${this.originalPlotWidth / 4}px`,
    //       height: `${this.originalPlotHeight / 4}px`,
    //       border: '2px solid #1DA1F2',
    //       position: 'absolute',
    //     };

    //     if (this.scatterPlotDataCluster.length > 0) {
    //       this.displayOverlayContainer = true;
    //       this.createScatterPlot('normal')
    //       this.createScatterPlot('minimap')
    //     }
    //   } else {
    //     this.displayOverlayContainer = false;
    //   }

    // });
  }

  createScatterPlot(size: any) {
    // this.displayPlot = true;
    // var margin = { top: 0, right: 0, bottom: 0, left: size === 'normal' ? this.legendWidth : 0 },
    //   width = size === 'normal' ? this.plotWidth - margin.left - margin.right + this.widthAdjustment + this.legendWidth : (this.plotWidth - margin.left - margin.right + this.widthAdjustment) / 4,
    //   height = size === 'normal' ? this.plotHeight - margin.top - margin.bottom + this.heightAdjustment : (this.plotHeight - margin.top - margin.bottom + this.heightAdjustment) / 4;

    // let scatterplotContainerId = size === 'normal' ? this.containerId : this.minimapContainerId;
    // d3.select(scatterplotContainerId)
    //   .selectAll('svg')
    //   .remove();

    // const pointTip = d3Tip()
    //   .attr('class', 'd3-tip')
    //   .offset([-10, 0])
    //   .html((event: any, d: any) => {
    //     let tipBox = this.useNormalization ? `<div><div class="category">Normalized Count:</div> ${d.totalCounts}</div>` : `<div><div class="category">Cluster ID:</div> ${d.clusterid}</div>`
    //     return tipBox
    //   });

    // var svg = d3.select(scatterplotContainerId)
    //   .append("svg")
    //   .attr("width", width + margin.left + margin.right)
    //   .attr("height", height + margin.top + margin.bottom)
    //   .append("g")
    //   .attr("transform",
    //     "translate(" + margin.left + "," + margin.top + ")");

    // svg.call(pointTip);

    // const color = d3.scaleLinear<string>()
    //   .domain([0, this.totalCountsMax])
    //   .range(["rgb(255,255,224)", this.selectedColor]);

    // const colorScale = d3.scaleOrdinal<string>()
    //   .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
    //   .range(this.clusterColors);

    // var x = d3.scaleLinear()
    //   .domain([this.xMin * (this.scaleFactor), this.xMax * (1 + this.scaleFactor)])
    //   .range([0, width]);

    // var y = d3.scaleLinear()
    //   .domain([this.yMin * this.scaleFactor, this.yMax * (1 + this.scaleFactor)])
    //   .range([height, 0]);

    // let useNorm = this.useNormalization

    // const circles = svg.append('g')
    //   .selectAll("dot")
    //   .data(useNorm ? this.scatterPlotData : this.scatterPlotDataCluster)
    //   .enter()
    //   .append("circle")
    //   .attr("cx", function (d) { return x(d.xValue) })
    //   .attr("cy", function (d) { return height - y(d.yValue); })
    //   .attr("r", 1.75)
    //   .attr("fill", d => {
    //     return useNorm ? color(d.totalCounts) : colorScale(d.clusterid)
    //   })

    // if (size === 'normal') {
    //   circles.on('mouseover', function (mouseEvent: any, d) {
    //     pointTip.show(mouseEvent, d, this);
    //     pointTip.style('left', mouseEvent.x + 10 + 'px');
    //   })
    //     .on('mouseout', pointTip.hide);
    // }




    // // Add Legend
    // if (this.legendWidth !== 0) {
    //   if (useNorm) {
    //     const gradient = svg.append("defs")
    //       .append("linearGradient")
    //       .attr("id", "legendGradient")
    //       .attr("x1", "0%")
    //       .attr("y1", "0%")
    //       .attr("x2", "100%")
    //       .attr("y2", "0%");

    //     gradient.append("stop")
    //       .attr("offset", "0%")
    //       .attr("stop-color", "white");

    //     gradient.append("stop")
    //       .attr("offset", "100%")
    //       .attr("stop-color", this.selectedColor);

    //     // const legendX = 300;
    //     const legendX = -this.legendWidth + 20;
    //     const legendY = 60;
    //     const borderWidth = 1;
    //     const legendBarWidth = 50;
    //     const legendBarHeight = 10;

    //     svg.append("rect")
    //       .attr("x", legendX - borderWidth)
    //       .attr("y", legendY - borderWidth)
    //       .attr("width", legendBarWidth + 2 * borderWidth)
    //       .attr("height", legendBarHeight + 2 * borderWidth)
    //       .style("stroke", "rgba(0, 0, 0, 0.3)")
    //       .style("fill", "none");

    //     // Create legend rectangle
    //     svg.append("rect")
    //       .attr("x", legendX)
    //       .attr("y", legendY)
    //       .attr("width", legendBarWidth)
    //       .attr("height", legendBarHeight)
    //       .style("fill", "url(#legendGradient)")

    //     svg.append("text")
    //       .attr("x", legendX)
    //       .attr("y", 80)
    //       .attr("text-anchor", "start")
    //       .attr("font-size", "6px")
    //       .text("0");

    //     const xmaxLabelWidth = this.totalCountsMax.toString().toLocaleString().length * 1;  // Adjust the font size multiplier as needed
    //     const adjustedXmaxLabelX = legendX + 60 - xmaxLabelWidth;

    //     svg.append("text")
    //       .attr("x", adjustedXmaxLabelX)
    //       .attr("y", 80)
    //       .attr("text-anchor", "end")
    //       .attr("font-size", "6px")
    //       .text(this.totalCountsMax.toLocaleString());

    //     svg.append("text")
    //       .attr("x", legendX)
    //       .attr("y", 50)
    //       .attr("text-anchor", "start")
    //       .attr("font-size", "6px")
    //       .attr("font-weight", "bold")
    //       .text("Counts");
    //   } else if (this.useCluster) {
    //     // Legend
    //     const clusterColors = Object.keys(this.clusterTypes).map(key => ({
    //       label: this.clusterTypes[key].label,
    //       color: this.clusterTypes[key].color
    //     }));
    //     clusterColors.sort((a, b) => {
    //       // Extracting the numerical part of the label
    //       const numA = parseInt(a.label.split(' ')[1]);
    //       const numB = parseInt(b.label.split(' ')[1]);

    //       // Comparing the numerical parts
    //       return numA - numB;
    //     });
    //     const legendWidth = this.legendWidth;

    //     const legend = svg
    //       .selectAll('.legend')
    //       .data(clusterColors)
    //       .enter()
    //       .append('g')
    //       .classed('legend', true)
    //       .attr('transform', function (d, i) {
    //         // return 'translate(0,' + (i * 15 + 50) + ')';
    //         return `translate(-${legendWidth},${i * 15 + 50})`;
    //       });

    //     legend
    //       .append('circle')
    //       .attr('r', 4)
    //       .attr('cx', 10)
    //       .attr('fill', d => d.color);

    //     legend
    //       .append('text')
    //       .attr('x', 20)
    //       .attr('dy', '.35em')
    //       .style('fill', '#000')
    //       .style('font-size', '8px')
    //       .attr('class', 'legend-label')
    //       .text(d => d.label);
    //   }
    // }

  }

  movePlot(direction: any, mode: any, container: any) {
    const plotContainer = document.querySelector('.plotContainer') as HTMLImageElement;
    const imageContainer = document.querySelector('.imageContainer') as HTMLImageElement;
    const imageContainer2 = document.querySelector('.imageContainer2') as HTMLImageElement;

    const miniBoxContainer = document.querySelector('.miniboxDiv') as HTMLImageElement;
    const minimapImageContainer = document.querySelector('.miniMapImageContainer') as HTMLImageElement;
    const minimapPlotContainer = document.querySelector('.minimapPlotContainer') as HTMLImageElement;

    let transformPlotValue;
    let transformBox;
    let transformImageValue;
    let transformImageMiniMapValue;
    let transformPlotMiniMapValue;

    if (mode === 'align' && container === 'plot') {
      switch (direction) {
        case 'left':
          this.currentLeft += this.moveAmount / (this.currentZoomScaleFactor + 1);
          break;
        case 'right':
          this.currentLeft -= this.moveAmount / (this.currentZoomScaleFactor + 1);
          break;
        case 'up':
          this.currentTop -= this.moveAmount / (this.currentZoomScaleFactor + 1);
          break;
        case 'down':
          this.currentTop += this.moveAmount / (this.currentZoomScaleFactor + 1);
          break;
        default:
          break;
      }
    } else if (mode === 'align' && container === 'image') {
      switch (direction) {
        case 'left':
          this.currentImageLeft += this.moveAmount / (this.currentZoomScaleFactor + 1);
          break;
        case 'right':
          this.currentImageLeft -= this.moveAmount / (this.currentZoomScaleFactor + 1);
          break;
        case 'up':
          this.currentImageTop -= this.moveAmount / (this.currentZoomScaleFactor + 1);
          break;
        case 'down':
          this.currentImageTop += this.moveAmount / (this.currentZoomScaleFactor + 1);
          break;
        default:
          break;
      }
    }

    //This is used move the viewbox around the minimap. Had to use some hardcoded numbers to keep the viewbox within the boundaries. Works for now but need a cleaner way of doing it in the future.
    let maxLeft = (this.currentZoomScaleFactor - 1) * this.plotWidth / 2;
    let maxTop = (this.currentZoomScaleFactor - 1) * this.plotHeight / 2;

    let signLeft = this.sliderLeft >= 0 ? 1 : 0;
    let signTop = this.sliderTop >= 0 ? 0 : 1;

    transformPlotValue = `translateX(${-(this.currentLeft * this.currentZoomScaleFactor + this.sliderLeft + this.legendWidth * (this.currentZoomScaleFactor - 1))}px) translateY(${this.currentTop * this.currentZoomScaleFactor + this.sliderTop}px) scaleX(${this.currentZoomScaleFactor}) scaleY(${this.currentZoomScaleFactor})`;
    transformImageValue = `translateX(${-(this.currentImageLeft * this.currentZoomScaleFactor + this.sliderLeft)}px) translateY(${this.currentImageTop * this.currentZoomScaleFactor + this.sliderTop}px) scaleX(${this.currentZoomScaleFactor}) scaleY(${this.currentZoomScaleFactor}) rotate(${this.currentDegree}deg)`;

    transformPlotMiniMapValue = `translateX(${-(this.currentLeft * this.currentZoomScaleFactor + this.sliderLeft) / 4}px) translateY(${(this.currentTop * this.currentZoomScaleFactor + this.sliderTop) / 4}px) scaleX(${this.currentZoomScaleFactor}) scaleY(${this.currentZoomScaleFactor})`;
    transformImageMiniMapValue = `translateX(${-(this.currentImageLeft * this.currentZoomScaleFactor + this.sliderLeft) / 4}px) translateY(${(this.currentImageTop * this.currentZoomScaleFactor + this.sliderTop) / 4}px) scaleX(${this.currentZoomScaleFactor}) scaleY(${this.currentZoomScaleFactor}) rotate(${this.currentDegree}deg)`;

    transformBox = `translateX(${this.scales[this.currentZoomScaleFactor][signLeft] * this.sliderLeft / maxLeft}%) translateY(${-this.scales[this.currentZoomScaleFactor][signTop] * this.sliderTop / maxTop}%) scaleX(${this.currentZoomScaleFactor}) scaleY(${this.currentZoomScaleFactor})`;
    if (mode === 'align' || mode === 'zoom' || mode === 'slider') {
      plotContainer.style.transform = transformPlotValue;
      imageContainer.style.transform = transformImageValue;
      imageContainer2.style.transform = transformImageValue;
      minimapImageContainer.style.transform = transformImageMiniMapValue;
      minimapPlotContainer.style.transform = transformPlotMiniMapValue;

      if (mode === 'zoom') {
        miniBoxContainer.style.transform = transformBox;
      }
    }

    this.selectionRectStyle = {
      top: `${0}px`,
      width: `${this.plotWidth / (4 * this.currentZoomScaleFactor)}px`,
      height: `${this.plotHeight / (4 * this.currentZoomScaleFactor)}px`,
      border: '2px solid #1DA1F2',
      position: 'absolute',
    };

  }

  captureAndDownloadImages() {
    this.isLoading = true;

    setTimeout(() => {
      let captureContainer = ''
      if (this.droppedFile && !this.overlayImage) {
        captureContainer = '.fullOverlayDiv'
      } else if (this.droppedFile && this.overlayImage) {
        captureContainer = '.overlayDiv'
      } else {
        captureContainer = '#scatter'
      }

      const containerToCapture = document.querySelector(captureContainer) as HTMLElement | null;

      if (containerToCapture) {
        html2canvas(containerToCapture, {
        }).then(canvas => {
          const dataURL = canvas.toDataURL();
          const link = document.createElement('a');
          link.href = dataURL;
          link.download = 'spatialGE.png';
          link.click();

          this.isLoading = false;
        });
      } else {
        this.isLoading = false;
        // this.notificationService.error(`Error occurred when downloading the image.`);
        console.error('Container element not found');
      }
    }, 500)
  }

  // onDropFile(event: DragEvent) {
  //   event.preventDefault();
  //   const files = event.dataTransfer?.files;
  //   if (files && files.length > 0) {
  //     this.droppedFile = files[0];
  //     this.displayFile();
  //   }
  // }

  // onDragOver(event: DragEvent) {
  //   event.preventDefault();
  // }

  // displayFile() {
  //   if (this.droppedFile) {
  //     this.displayImage = true;
  //     if (this.isImageType(this.droppedFile.type)) {
  //       const reader = new FileReader();
  //       reader.onload = (event) => {
  //         const image = new Image();
  //         image.onload = () => {
  //           const aspectRatio = image.width / image.height;
  //           this.imageAdjustedWidth = Math.ceil(this.plotHeight * aspectRatio);
  //           this.maxImageContainerWidthOverylay = Math.max(this.imageAdjustedWidth, (this.plotWidth + this.widthAdjustment))
  //           this.maxImageContainerWidthSidebySide = Math.max((this.plotWidth + this.widthAdjustment) * 2, (this.plotWidth + this.widthAdjustment + this.imageAdjustedWidth))

  //           this.droppedFileURL = reader.result as string;
  //         };
  //         image.src = event.target?.result as string;
  //       };
  //       reader.readAsDataURL(this.droppedFile);
  //     }
  //   }
  // }

  // isImageType(fileType: string): boolean {
  //   return fileType.startsWith('image/');
  // }

  // onFileSelected(event: any): void {
  //   const fileList: FileList = event.target.files;
  //   if (fileList.length > 0) {
  //     this.droppedFile = fileList[0];
  //     this.displayFile();
  //   }
  // }

  applyZoom(type: any) {
    if (type === '-' && this.currentZoomScaleFactor === 1) {
      this.currentZoomScaleFactor = 0.5;
    } else if (type === '+' && this.currentZoomScaleFactor === 0.5) {
      this.currentZoomScaleFactor = 1
    } else if (type === '+') {
      this.currentZoomScaleFactor += 1
    } else if (type === '-') {
      this.currentZoomScaleFactor -= 1
    }
    const plotContainer = document.querySelector('.plotContainer') as HTMLImageElement;
    const imageContainer = document.querySelector('.imageContainer') as HTMLImageElement;
    const imageContainer2 = document.querySelector('.imageContainer2') as HTMLImageElement;

    const miniMapContainer = document.querySelector('.miniMapContainer') as HTMLImageElement;
    const miniSubContainer = document.querySelector('.miniSubContainer') as HTMLImageElement;
    const minimapImageContainer = document.querySelector('.miniMapImageContainer') as HTMLImageElement;
    const minimapPlotContainer = document.querySelector('.minimapPlotContainer') as HTMLImageElement;

    const miniBoxContainer = document.querySelector('.miniboxDiv') as HTMLImageElement;

    this.sliderLeft = 0;
    this.sliderTop = 0;

    if (this.currentZoomScaleFactor === 1) {
      this.legendWidth = 120
    } else {
      this.legendWidth = 0
    }

    if (plotContainer || imageContainer) {
      const transformPlotValue = `translateX(${-this.currentLeft * this.currentZoomScaleFactor + this.sliderLeft}px) translateY(${this.currentTop * this.currentZoomScaleFactor + this.sliderTop}px) scaleX(${this.currentZoomScaleFactor}) scaleY(${this.currentZoomScaleFactor})`;
      const transformImageValue = `translateX(${-this.currentImageLeft * this.currentZoomScaleFactor + this.sliderLeft}px) translateY(${this.currentImageTop * this.currentZoomScaleFactor + this.sliderTop}px) rotate(${this.currentDegree}deg) scaleX(${this.currentZoomScaleFactor}) scaleY(${this.currentZoomScaleFactor})`;

      plotContainer.style.transform = transformPlotValue;
      imageContainer.style.transform = transformImageValue;
      imageContainer2.style.transform = transformImageValue;

      const minimapPlotTransformValue = `translateX(${-(this.currentLeft * this.currentZoomScaleFactor + this.sliderLeft) / 4}px) translateY(${(this.currentTop * this.currentZoomScaleFactor + this.sliderTop) / 4}px) scaleX(${this.currentZoomScaleFactor}) scaleY(${this.currentZoomScaleFactor})`;
      const minimapImageTransformValue = `translateX(${-(this.currentImageLeft * this.currentZoomScaleFactor + this.sliderLeft) / 4}px) translateY(${(this.currentImageTop * this.currentZoomScaleFactor + this.sliderTop) / 4}px) scaleX(${this.currentZoomScaleFactor}) scaleY(${this.currentZoomScaleFactor}) rotate(${this.currentDegree}deg)`;

      minimapImageContainer.style.transform = minimapImageTransformValue;
      minimapPlotContainer.style.transform = minimapPlotTransformValue;

      const transformMiniMapValue = `scaleX(${1 / this.currentZoomScaleFactor}) scaleY(${1 / this.currentZoomScaleFactor})`;
      miniMapContainer.style.transform = transformMiniMapValue
    }

    let selectionRectWidth = this.originalPlotWidth / (4 * this.currentZoomScaleFactor);
    let selectionRectHeight = this.originalPlotHeight / (4 * this.currentZoomScaleFactor);

    this.selectionRectStyle = {
      top: `${0}px`,
      width: `${selectionRectWidth}px`,
      height: `${selectionRectHeight}px`,
      border: '2px solid #1DA1F2',
      position: 'absolute',
    };

    let centerAdjustmentWidth = this.currentZoomScaleFactor === 1 ? 0 : selectionRectWidth / 2;
    let centerAdjustmentHeight = this.currentZoomScaleFactor === 1 ? 0 : selectionRectHeight / 2;
    let transformBox = `translateX(${this.currentZoomScaleFactor === 0.5 ? -40 : this.currentLeft + centerAdjustmentWidth}px) translateY(${this.currentZoomScaleFactor === 0.5 ? -50 : this.currentTop + centerAdjustmentHeight}px) scaleX(${this.currentZoomScaleFactor}) scaleY(${this.currentZoomScaleFactor})`;

    miniBoxContainer.style.transform = transformBox;
    miniSubContainer.style.transform = `scale(${this.currentZoomScaleFactor === 0.5 ? 0.5 : 1})`;

    this.createScatterplotWithPieCharts('normal')
    this.createScatterplotWithPieCharts('minimap')
  }

  stretchPlot(axis: any, direction: any) {
    if (axis === 'x-axis' && direction === '+') {
      this.widthAdjustment += 1;
    } else if (axis === 'x-axis' && direction === '-') {
      this.widthAdjustment -= 1;
    } else if (axis === 'y-axis' && direction === '+') {
      this.heightAdjustment += 1;
    } else if (axis === 'y-axis' && direction === '-') {
      this.heightAdjustment -= 1;
    }

    this.createScatterplotWithPieCharts('normal')
    this.createScatterplotWithPieCharts('minimap')
  }

  setAlignmentMode() {
    this.createScatterplotWithPieCharts('normal')
    this.createScatterplotWithPieCharts('minimap')
  }

  setZoomMode() {
    this.createScatterplotWithPieCharts('normal')
    this.createScatterplotWithPieCharts('minimap')
  }

  minLeftValue(): number {
    return -(this.plotWidth) * (this.currentZoomScaleFactor - 1) / 2;
  }

  maxLeftValue(): number {
    return (this.plotWidth) * (this.currentZoomScaleFactor - 1) / 2;
  }

  minTopValue(): number {
    return -this.plotHeight * (this.currentZoomScaleFactor - 1) / 2;
  }

  maxTopValue(): number {
    return this.plotHeight * (this.currentZoomScaleFactor - 1) / 2;
  }

  rotateImage(direction: any) {
    const imageContainer = document.querySelector('.imageContainer') as HTMLImageElement;
    const imageContainer2 = document.querySelector('.imageContainer2') as HTMLImageElement;
    const minimapImageContainer = document.querySelector('.miniMapImageContainer') as HTMLImageElement;

    const increment = this.axisSwapped ? -1 : 1;
    // this.scaleXCustom = this.currentZoomScaleFactor

    if (direction === "+") {
      this.currentDegree += increment;
    } else {
      this.currentDegree -= increment;
    }

    let transformImageValue = `translateX(${-(this.currentImageLeft + this.sliderLeft)}px) translateY(${this.currentImageTop + this.sliderTop}px) scaleX(${this.scaleXCustom * this.currentZoomScaleFactor}) scaleY(${this.currentZoomScaleFactor}) rotate(${this.currentDegree}deg)`;
    let transformMiniMapValue = `translateX(${-(this.currentImageLeft + this.sliderLeft) / 4}px) translateY(${(this.currentImageTop + this.sliderTop) / 4}px) scaleX(${this.scaleXCustom * this.currentZoomScaleFactor}) scaleY(${this.currentZoomScaleFactor}) rotate(${this.currentDegree}deg)`;

    imageContainer.style.transform = transformImageValue;
    imageContainer2.style.transform = transformImageValue;
    minimapImageContainer.style.transform = transformMiniMapValue
  }

  swapAxis() {
    const imageContainer = document.querySelector('.imageContainer') as HTMLImageElement;
    const imageContainer2 = document.querySelector('.imageContainer2') as HTMLImageElement;
    const minimapImageContainer = document.querySelector('.miniMapImageContainer') as HTMLImageElement;

    this.axisSwapped = !this.axisSwapped;
    if (this.axisSwapped === false) {
      this.currentDegree -= 90
    } else {
      this.currentDegree += 90
    }

    this.scaleXCustom *= -1

    let transformImageValue = `translateX(${-(this.currentImageLeft + this.sliderLeft)}px) translateY(${this.currentImageTop + this.sliderTop}px)  scaleX(${this.scaleXCustom * this.currentZoomScaleFactor}) scaleY(${this.currentZoomScaleFactor}) rotate(${this.currentDegree}deg)`;
    let transformMiniMapValue = `translateX(${-(this.currentImageLeft + this.sliderLeft) / 4}px) translateY(${(this.currentImageTop + this.sliderTop) / 4}px)  scaleX(${this.scaleXCustom * this.currentZoomScaleFactor}) scaleY(${this.currentZoomScaleFactor}) rotate(${this.currentDegree}deg)`;

    imageContainer.style.transform = transformImageValue;
    imageContainer2.style.transform = transformImageValue;
    minimapImageContainer.style.transform = transformMiniMapValue;
  }

  flipAxis(axis: any) {
    const imageContainer = document.querySelector('.imageContainer') as HTMLImageElement;
    const imageContainer2 = document.querySelector('.imageContainer2') as HTMLImageElement;
    const minimapImageContainer = document.querySelector('.miniMapImageContainer') as HTMLImageElement;

    let flipX = 1;
    let flipY = 1;
    if (axis === 'horizontal') {
      this.xAxisFlipped = !this.xAxisFlipped;
      flipX = this.xAxisFlipped ? -1 : 1;
    } else {
      this.yAxisFlipped = !this.yAxisFlipped;
      flipY = this.yAxisFlipped ? -1 : 1;
    }

    let verticalImageTransform = `translateX(${-(this.currentImageLeft + this.sliderLeft)}px) translateY(${this.currentImageTop + this.sliderTop}px) scaleX(${this.currentZoomScaleFactor}) scaleY(${flipY * this.currentZoomScaleFactor}) rotate(${this.currentDegree}deg)`;
    let horizontalImageTransform = `translateX(${-(this.currentImageLeft + this.sliderLeft)}px) translateY(${this.currentImageTop + this.sliderTop}px) scaleX(${flipX * this.currentZoomScaleFactor}) scaleY(${this.currentZoomScaleFactor}) rotate(${this.currentDegree}deg)`;
    let transformImageValue = axis === 'vertical' ? verticalImageTransform : horizontalImageTransform;

    let verticalMiniMapTransform = `translateX(${-((this.currentLeft + this.sliderLeft) / 4)}px) translateY(${(this.currentTop + this.sliderTop) / 4}px) scaleX(${this.currentZoomScaleFactor}) scaleY(${flipY * this.currentZoomScaleFactor}) rotate(${this.currentDegree}deg)`;
    let horizontalMiniMapTransform = `translateX(${-((this.currentLeft + this.sliderLeft) / 4)}px) translateY(${(this.currentTop + this.sliderTop) / 4}px) scaleX(${flipX * this.currentZoomScaleFactor}) scaleY(${this.currentZoomScaleFactor}) rotate(${this.currentDegree}deg)`;
    let transformMiniMapImageValue = axis === 'vertical' ? verticalMiniMapTransform : horizontalMiniMapTransform;

    imageContainer.style.transform = transformImageValue;
    imageContainer2.style.transform = transformImageValue;
    minimapImageContainer.style.transform = transformMiniMapImageValue;
  }

  //copied from spotlight.ts starting here

  plotData: any = {};
  limit = 0.1
  // xMin = 100000;
  // xMax = 0;
  // yMin = 100000;
  // yMax = 0;
  // plotWidth = 300;
  // plotHeight = 500;

  // displayImage = true;
  // displayPlot = true;
  // displayAlignment = false;
  // overlayImage = false;
  // droppedFile: File | null = null;
  // droppedFileURL: string | ArrayBuffer | null = null;

  // plotOpacityValue = .7
  // imageOpacityValue = .5
  // scaleFactor = 0.0530973;
  // scaleFactor = 0;
  // currentZoomScaleFactor = 1;
  // widthAdjustment = 0
  // heightAdjustment = 0
  // legendWidth = 130;

  // imageAdjustedWidth = 0;
  // maxImageContainerWidthOverylay = this.plotWidth;
  // maxImageContainerWidthSidebySide = this.plotWidth * 2;
  // displayOverlayContainer = true;

  pieChartColors: any = {};
  colorIndex = 0;
  colorsArray = [
    "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c",
    "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5",
    "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f",
    "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"
  ];

  getDataSpotlight() {
    this.http.get('assets/kidney_spotlight_spatial_coords.tsv', { responseType: 'text' }).subscribe(
      data => {
        // Parse the TSV data
        let fileData = this.parseTsv(data);
        for (let gene of fileData) {
          let key = gene.name
          let x = gene["pxl_row_in_fullres"]
          let y = gene["pxl_col_in_fullres"]
          this.xMin = Math.min(this.xMin, x)
          this.xMax = Math.max(this.xMax, x)
          this.yMin = Math.min(this.yMin, y)
          this.yMax = Math.max(this.yMax, y)



          this.plotData[key] = {
            x,
            y
          }


          let normalizePlot = (this.xMax - this.xMin) / 500 // This will set the plot to a width of 500px
          this.plotWidth = (this.xMax - this.xMin) / normalizePlot;
          this.plotHeight = (this.yMax - this.yMin) / normalizePlot;


        }
        if (this.originalPlotWidth === 0) {
          console.log("xmax/min: ", this.xMax, this.xMin)
          this.originalPlotWidth = this.plotWidth;
          this.originalPlotHeight = this.plotHeight;
        }
        console.log("original: ", this.originalPlotWidth, this.originalPlotHeight)
      },
      error => {
        console.error('Error fetching TSV file:', error);
      }
    );

    this.http.get('assets/kidney_spotlight_output.tsv', { responseType: 'text' }).subscribe(
      data => {
        // Parse the TSV data
        let pieData = this.parseTsv(data);

        for (let gene of pieData) {
          let geneName = gene.gene
          let pieArr = [];
          for (const key in gene) {

            if (!this.pieChartColors[key] && key != 'gene') {
              this.pieChartColors[key] = this.colorsArray[this.colorIndex]
              this.colorIndex++;
              // console.log("key: ", key)
            }

            if (gene[key] > this.limit) {
              let temp = {
                [key]: gene[key]
              }
              pieArr.push(temp)
            }
          }
          this.plotData[geneName] = {
            ...this.plotData[geneName],
            "pieData": pieArr
          }

        }
        this.formatData()

      },
      error => {
        console.error('Error fetching TSV file:', error);
      }
    );
  }

  parseTsv(tsvData: string): any[] {
    const lines = tsvData.split(/\r?\n/); // Split by '\n' or '\r\n'
    const result: any[] = [];
    const headers = lines[0].split('\t').map(header => header.trim()); // Trim whitespace from headers

    for (let i = 1; i < lines.length; i++) {
      const obj: any = {};
      const currentLine = lines[i].split('\t').map(field => field.trim()); // Trim whitespace from fields

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j];
      }

      result.push(obj);
    }

    return result;
  }

  // scatterPlotData: any = [];
  geneDict: any = {};
  formatData() {
    for (let index in this.plotData) {
      let obj = this.plotData[index]

      let sum = 0
      for (let geneObj of obj.pieData) {
        for (const key in geneObj) {
          sum += Number(geneObj[key])

        }
      }
      for (let geneObj of obj.pieData) {
        for (const key in geneObj) {
          let newVal = Number(geneObj[key]) / sum * 100;
          let temp = {
            label: key,
            value: newVal,
            name: index
          }
          if (!this.plotData[index]["pieData2"]) {
            this.plotData[index]["pieData2"] = []
          }
          this.plotData[index]["pieData2"].push(temp)
          let temp2 = {
            label: key,
            value: newVal
          }

          if (!this.geneDict[index]) {
            this.geneDict[index] = []
          }
          this.geneDict[index].push(temp2)

        }
      }


    }
    //convert to an array. fix this later.
    for (let geneName in this.plotData) {
      this.scatterPlotData.push(this.plotData[geneName])
    }
    console.log("got here")
    // this.createScatterplotWithPieCharts('normal');
    this.createScatterplotWithPieCharts('normal')
    this.createScatterplotWithPieCharts('minimap')
  }

  createScatterplotWithPieCharts(size: string): void {
    this.displayPlot = true;
    let scatterplotContainerId = size === 'normal' ? this.containerId : this.minimapContainerId;
    const data = this.scatterPlotData
    console.log("data: ", data, this.plotWidth, this.plotHeight)

    // const margin = { top: 10, right: 10, bottom: 10, left: this.legendWidth };
    // const width = this.plotWidth - margin.right;
    // const height = this.plotHeight - margin.top - margin.bottom;

    var margin = { top: 10, right: 10, bottom: 10, left: size === 'normal' ? this.legendWidth : 0 },
      width = size === 'normal' ? this.plotWidth - margin.left - margin.right + this.widthAdjustment + this.legendWidth : (this.plotWidth - margin.left - margin.right + this.widthAdjustment) / 4,
      height = size === 'normal' ? this.plotHeight - margin.top - margin.bottom + this.heightAdjustment : (this.plotHeight - margin.top - margin.bottom + this.heightAdjustment) / 4;


    d3.select(scatterplotContainerId)
      .selectAll('svg')
      .remove();

    const pointTip = d3Tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html((event: any, d: any) => {
        // let tipBox = `<div>${d.data.name}</div><div><div class="category">${d.data.label}: ${Math.round(d.data.value)} %</div>`
        let tipBox = `<div class="tipHeader">${d.data.name}</div>`;
        for (let key in this.geneDict[d.data.name]) {
          tipBox += `<div><div class="tipKey">${this.geneDict[d.data.name][key].label}:</div> ${Math.round(this.geneDict[d.data.name][key].value)}%</div>`
        }
        return tipBox
      });

    const svg = d3.select(scatterplotContainerId)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    svg.call(pointTip);

    const x = d3.scaleLinear()
      .domain([this.xMin * (1 - this.scaleFactor), this.xMax * (1 + this.scaleFactor)])
      .range([0, width]);
    // svg.append("g")
    //   .attr("transform", "translate(0," + height + ")")
    //   .call(d3.axisBottom(x));

    const y = d3.scaleLinear()
      .domain([this.yMin * (1 - this.scaleFactor), this.yMax * (1 + this.scaleFactor)])
      .range([0, height]);
    // svg.append("g")
    //   .call(d3.axisLeft(y));

    // svg.selectAll('dot')
    //   .data(data)
    //   .enter()
    //   .append("circle")
    //   .attr("cx", (d: any) => x(parseInt(d.x)))
    //   .attr("cy", (d: any) => y(parseInt(d.y)))
    //   .attr("r", 3)
    //   .style("fill", "#69b3a2");

    // Add pie charts for each data point
    data.forEach((d: any) => {
      const pie = d3.pie<any>().value((p: any) => p.value);

      // Create arc generator
      // @ts-ignore
      const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(3) as d3.ValueFn<SVGPathElement, d3.PieArcDatum<any>, string | null>

      if (d.pieData2) {
        const pieData = pie(d.pieData2);
        const pieGroup = svg.append("g")
          .attr("transform", `translate(${x(d.x)}, ${y(d.y)})`);

        pieGroup.selectAll("path")
          .data(pieData)
          .enter()
          .append("path")
          .attr("d", arc)
          // .attr("fill", (p: any, i: number) => 
          //   d3.schemeCategory10[i]
          // )
          .attr("fill", (p: any) => {
            return this.pieChartColors[p.data.label]; // Assuming each data point has a 'key' property
          });

        pieGroup
          .data(pieData)
          .on('mouseover', function (mouseEvent: any, d) {
            pointTip.show(mouseEvent, d, this);
            pointTip.style('left', mouseEvent.x + 10 + 'px');
          })
          .on('mouseout', pointTip.hide);

      }

    });

    // Add Legend
    const clusterColors = Object.keys(this.pieChartColors).map(key => ({
      label: key,
      color: this.pieChartColors[key]
    }));
    clusterColors.sort((a, b) => {
      // Extracting the numerical part of the label
      const numA = parseInt(a.label.split(' ')[1]);
      const numB = parseInt(b.label.split(' ')[1]);

      // Comparing the numerical parts
      return numA - numB;
    });
    const legend = svg
      .selectAll('.legend')
      .data(clusterColors)
      .enter()
      .append('g')
      .classed('legend', true)
      .attr('transform', function (d, i) {
        return `translate(${-(width + 130)}, ${i * 15 + 50})`;
      });

    legend
      .append('circle')
      .attr('r', 4)
      .attr('cx', width + 10)
      .attr('fill', d => d.color);

    legend
      .append('text')
      .attr('x', width + 20)
      .attr('dy', '.35em')
      .style('fill', '#000')
      .style('font-size', '8px')
      .attr('class', 'legend-label')
      .text(d => d.label);

  }


  isImageType(fileType: string): boolean {
    return fileType.startsWith('image/');
  }

  onDropFile(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.droppedFile = files[0];
      this.displayFile();
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  displayFile() {
    if (this.droppedFile) {
      this.displayImage = true;
      if (this.isImageType(this.droppedFile.type)) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const image = new Image();
          image.onload = () => {
            const aspectRatio = image.width / image.height;
            this.imageAdjustedWidth = Math.ceil(this.plotHeight * aspectRatio);
            this.maxImageContainerWidthOverylay = Math.max(this.imageAdjustedWidth, (this.plotWidth + this.widthAdjustment))
            this.maxImageContainerWidthSidebySide = Math.max((this.plotWidth + this.widthAdjustment) * 2, (this.plotWidth + this.widthAdjustment + this.imageAdjustedWidth))

            this.droppedFileURL = reader.result as string;
          };
          image.src = event.target?.result as string;
        };
        reader.readAsDataURL(this.droppedFile);
      }
    }
  }

  onFileSelected(event: any): void {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.droppedFile = fileList[0];
      this.displayFile();
    }
  }
}
