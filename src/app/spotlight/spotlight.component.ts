
import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
// @ts-ignore
import d3Tip from 'd3-tip';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-spotlight',
  templateUrl: './spotlight.component.html',
  styleUrls: ['./spotlight.component.scss']
})
export class SpotlightComponent implements OnInit {
  plotData: any = {};
  limit = 0.1
  xMin = 100000;
  xMax = 0;
  yMin = 100000;
  yMax = 0;
  plotWidth = 300;
  plotHeight = 500;

  displayImage = true;
  displayPlot = true;
  displayAlignment = false;
  overlayImage = false;
  droppedFile: File | null = null;
  droppedFileURL: string | ArrayBuffer | null = null;

  plotOpacityValue = .7
  imageOpacityValue = .5
  scaleFactor = 0.0530973;
  // scaleFactor = 0;
  currentZoomScaleFactor = 1;
  widthAdjustment = 0
  heightAdjustment = 0
  legendWidth = 130;

  imageAdjustedWidth = 0;
  maxImageContainerWidthOverylay = this.plotWidth;
  maxImageContainerWidthSidebySide = this.plotWidth * 2;
  displayOverlayContainer = true;

  pieChartColors: any = {};
  colorIndex = 0;
  colorsArray = [
    "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c",
    "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5",
    "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f",
    "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"
  ];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
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
              console.log("key: ", key)
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

  scatterPlotData: any = [];
  geneDict: any = {};
  formatData() {
    for (let index in this.plotData) {
      // console.log("index: ", index)
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
    this.createScatterplotWithPieCharts();
  }

  createScatterplotWithPieCharts(): void {
    const data = this.scatterPlotData

    const margin = { top: 10, right: 10, bottom: 10, left: this.legendWidth };
    const width = this.plotWidth - margin.right;
    const height = this.plotHeight - margin.top - margin.bottom;


    d3.select("#scatter")
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

    const svg = d3.select("#scatter")
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
