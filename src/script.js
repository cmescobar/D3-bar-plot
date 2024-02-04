import React from "https://esm.sh/react";
import ReactDOM from "https://esm.sh/react-dom";
import $ from "https://esm.sh/jquery";
import * as d3 from "https://esm.sh/d3";


async function getData() {
  const response = await fetch('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json');
  const data = await response.json();
  return data;
}

class Plot extends React.Component {
  constructor(props) {
    super(props);
    this.plotData = this.plotData.bind(this);
  }
  
  async plotData() {
    const data = await getData();
    const dataset = data.data;

    // Parameter definition
    const barWidth = this.props.width / dataset.length;
    
    // Scale the years
    // const yearsToScale = dataset.map((d) => yearsFunction(d));
    let yearsToScale = dataset.map((d) => new Date(d[0]));
    let lastYear = new Date(d3.max(yearsToScale));
    lastYear.setMonth(lastYear.getMonth() + 3);
    
    // Scales definition
    const xScale = d3.scaleTime()
                     .domain([d3.min(yearsToScale), lastYear])
                     .range([this.props.padding + this.props.gapYAxis, this.props.width - this.props.padding]);
    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(dataset, (d) => d[1])])
                     .range([this.props.height - this.props.padding - this.props.gapXAxis, 15]);
    
    // Create a svg
    const svg = d3.select(this.refs.PlotObject)
                  .append('svg')
                  .attr('width', this.props.width)
                  .attr('height', this.props.height);
    
    // Tooltip
    let tooltip = d3.select(this.refs.PlotObject)
                    .append('div')
                    .attr('id', 'tooltip')
                    .style('opacity', '0');
    
    // Attaching the data
    svg.selectAll('rect')
       .data(dataset)
       .enter()
       .append('rect')
         .attr('x', (d, i) => xScale(yearsToScale[i]))
         .attr('y', (d) => yScale(d[1]))
         .attr('width', barWidth)
         .attr('height', (d) => yScale(0) - yScale(d[1]))
         .attr('fill', 'orange')
         .attr('class', 'bar')
         .attr('data-date', (d) => d[0])
         .attr('data-gdp', (d) => d[1])
       .on('mouseover', (event, d) => {
            tooltip.style('opacity', '0.9')
                   .html(`<p>GDP on <b>${d[0]}</b> <br/> was \$<b>${d[1]}</b> Billion</p>`)
                   .attr('data-date', d[0])
          })
       .on("mousemove", (event, d) => {
            tooltip.style("left", event.pageX + "px")
                   .style("top", event.pageY + "px");
          })
       .on('mouseout', () => tooltip.style('opacity', '0'))
    
    // Axis X
    const xAxis = d3.axisBottom(xScale);
    svg.append('g')
       .attr('transform', `translate(0, ${this.props.height - this.props.padding})`)
       .attr('id', 'x-axis')
       .call(xAxis);
    
    // Axis Y
    const yAxis = d3.axisLeft(yScale);
    svg.append('g')
       .attr('transform', `translate(${this.props.padding}, 0)`)
       .attr('id', 'y-axis')
       .call(yAxis);
    
    // x-axis label
    svg.append('text')
       .attr('id', 'x-axis-label')
       .text('Years');
    
    const xAxisText = document.getElementById('x-axis-label');
    xAxisText.style.fontSize = this.props.labelFontSize;
    svg.select('#x-axis-label')
       .attr('x', ((this.props.width - this.props.padding - this.props.gapYAxis) + xAxisText.clientWidth) / 2 )
       .attr('y', 400);
    
    // y-axis label
    svg.append('text')
       .attr('id', 'y-axis-label')
       .attr('transform', 'rotate(-90)')
       .text('Gross Domestic Product');
    
    const yAxisText = document.getElementById('y-axis-label');
    yAxisText.style.fontSize = this.props.labelFontSize;
    svg.select('#y-axis-label')
       .attr('x', -((this.props.height - this.props.padding - this.props.gapXAxis) + yAxisText.clientWidth) / 2 )
       .attr('y', 80);
  }
  
  componentDidMount() {
    this.plotData();
  }
  
  render() {
    return (
      <div id='plot'>
        <div id='title'>GDP Plot</div>
        <div id='plotter' ref='PlotObject'/>
      </div>
    );
  }
}


$(document).ready(function () {
  ReactDOM.render(<Plot width={800} height={400} padding={50} gapXAxis={0} gapYAxis={0} labelFontSize={16}/>, document.getElementById('app'));
});