import React, { useEffect, useCallback } from "react";
import PropTypes from 'prop-types';
import useWindowSize from "@rehooks/window-size";
import moment from "moment";
import styled from 'styled-components';
import * as d3 from "d3";

// TODO 
// Add animations 
// Stop and start button
// xAais process arrow 
// yAxis bar styling 

export default function Bar({ barData }) {
  const windowSize = useWindowSize().innerWidth;

  const getWidth = useCallback(() => {
    if (windowSize < 1024) {
      return windowSize * 0.7;
    } else {
      return 700;
    }
  }, [windowSize]);

  const elementWidth = getWidth() + 100;
  useEffect(() => {
    if (!Object.keys(barData).length) {
      return;
    }

    // TODO refactor formatting data -_- 
    for (let i in barData) {
      barData[i].map(data => {
        data.country = i;
        return data;
      });
    }

    const formattedData = Object.values(barData).flat(Infinity).reduce((acc, cur) => {
      if (!acc[cur.date])
        acc[cur.date] = [];
      if (cur.confirmed > 0)
        acc[cur.date].push(cur);

      acc[cur.date].sort((a, b) => { return b.confirmed - a.confirmed });
      return acc;
    }, []);

    const data = Object.values(formattedData);

    const drawChart = () => {
      let time = 0;

      const margin = { left: 95, right: 20, top: 20, bottom: 30 };
      const height = 475 - margin.top - margin.bottom;
      const width = getWidth();

      const minDate = d3.min(data[0], d => {
        return moment(d.date);
      });
      const maxDate = d3.max(data[data.length - 1], d => {
        return moment(d.date);
      });

      const g = d3
        .select('#bar')
        .append("svg")
        .attr("class", "bar-svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3
        .scaleTime()
        .domain([minDate, maxDate])
        .range([0, width - 60]);

      const xAxis = g
        .attr("class", "x axis")
        .append("g")
        .call(d3.axisBottom(x).ticks(d3.timeWeek.every(windowSize < 700 ? 6 : 3)))
        .attr("transform", `translate(0,${height})`);

      const y = d3
        .scaleBand()
        .range([50, height])
        .padding(0.2);

      const yAxis = d3
        .axisLeft(y);
      g.append("g")
        .attr("class", "y axis")
        .call(yAxis);

      const title = g
        .append("text")
        .attr("text-anchor", "middle")
        .attr("y", 0)
        .attr("x", width / 2 - 40)
        .attr("class", "title-label")
      title.text("Corona Virus Spread")

      const dateLabel = g
        .append("text")
        .attr("y", height - 80)
        .attr("x", width - 65)
        .attr("class", "date-label")
        .attr("fill", "#575656")

      const casesLabel = g
        .append("text")
        .attr("y", height - 60)
        .attr("x", width - 65)
        .attr("class", "case-label")
        .attr("fill", "#5d99cb");

      const recoveredLabel = g
        .append("text")
        .attr("y", height - 40)
        .attr("x", width - 65)
        .attr("class", "recovered-label")
        .attr("fill", "#4fc486");

      const deathsLabel = g
        .append("text")
        .attr("y", height - 20)
        .attr("x", width - 65)
        .attr("class", "deaths-label")
        .attr("fill", "#b04c3b");

      function getTotal(data, key) {
        return data.reduce((acc, cur) => acc + cur[key], 0)
      }

      d3.interval(() => {
        time = time < data.length - 1 ? time + 1 : 0;
        update(data[time]);
      }, 180);

      update(data[0]);

      function update(data) {

        const tenResults = data.slice(0, 10);

        let t = d3.transition().duration(180);
        let cases = g.selectAll(".cases").data(tenResults);
        let barLabel = g.selectAll(".bar").data(tenResults);
        let recovered = g.selectAll(".recovered").data(tenResults);
        let deaths = g.selectAll(".deaths").data(tenResults);

        cases
          .exit()
          .attr("class", "exit cases")
          .remove();

        barLabel
          .exit()
          .attr("class", "exit bar")
          .remove();

        recovered
          .exit()
          .attr("class", "exit recovered")
          .remove();

        deaths
          .exit()
          .attr("class", "exit deaths")
          .remove();

        x.domain([0, d3.max(tenResults, d => d.confirmed)]);
        y.domain(tenResults.map(d => d.country));

        cases
          .enter()
          .append('rect')
          .attr("class", "enter cases")
          .merge(cases)
          .transition(t)
          .attr("y", d => y(d.country))
          .attr("width", d => x(d.confirmed))
          .attr("height", d => y.bandwidth())
          .attr("z-index", 1)
          .attr("fill", "#5d99cb")

        barLabel
          .enter()
          .append('text')
          .attr("class", "enter bar")
          .merge(barLabel)
          .transition(t)
          .attr("y", d => y(d.country) + 20)
          .attr("x", d => x(d.confirmed) + 10)
          .attr("whiteSpace", "nowrap")
          .attr("z-index", 6)
          .attr("height", d => y.bandwidth())
          .text(d => (d.confirmed.toLocaleString()))
          .attr("fill", "#000");

        recovered
          .enter()
          .append('rect')
          .attr("class", "enter recovered")
          .merge(recovered)
          .transition(t)
          .attr("y", d => y(d.country))
          .attr("width", d => x(d.recovered))
          .attr("height", d => y.bandwidth())
          .attr("z-index", 2)
          .attr("fill", "#4fc486");

        deaths
          .enter()
          .append('rect')
          .attr("class", "enter deaths")
          .merge(deaths)
          .transition(t)
          .attr("y", d => y(d.country))
          .attr("width", d => x(d.deaths))
          .attr("height", d => y.bandwidth())
          .attr("z-index", 3)
          .attr("fill", "#b04c3b");

        g.selectAll(".y.axis")
          .call(yAxis)
          .selectAll(".domain, .tick line")
          .remove();

        dateLabel.text(moment(data[0].date).format("D MMM"))
        casesLabel.text(`Cases: ${getTotal(data, 'confirmed').toLocaleString()}`);
        recoveredLabel.text(`Recovered: ${getTotal(data, 'recovered').toLocaleString()}`);
        deathsLabel.text(`Deaths: ${getTotal(data, 'deaths').toLocaleString()}`);

      }
    };

    // The chart is redrawn when the device orientation is changed.
    // So if present remove it.
    if (document.getElementsByClassName("bar-svg").length) {
      document.getElementsByClassName("bar-svg")[0].remove();
      drawChart();
    } else {
      drawChart();
    }
  }, [barData, getWidth]);
  return (
    <BarChart>
      <div id='bar' width={elementWidth.toFixed().toString()} height='475' />
    </BarChart>
  );
}

const BarChart = styled.div`
  .bar-svg{
    margin: 0 auto;
    display: block;
  }

  .covid-title{
    text-align: center;
    font-size: 20px;
  }

  .date-label, .case-label, .recovered-label, .deaths-label{
    text-anchor: end;
  }
  .case-label, .recovered-label, .deaths-label{
    font-size: 18px;
  }

  .date-label{
    font-size: 23px;
  }
  .title-label{
    font-size: 24px;
    fill: #575656;
  }

  .enter.bar{
    font-size: 12px;
  }

  @media (max-width: 425px) {
    .case-label, .recovered-label, .deaths-label{
      font-size: 10px;
    }
    .case-label{
      margin-top: 10px;
      position: relative;
      
    }
    .covid-title{
      width: 45%;
    }
    .date-label{
      font-size: 13px;
    }
  
    .title-label{
      font-size: 20px;
    }
    .enter.bar{
      font-size: 10px;
    }
  }
`;

Bar.propTypes = {
  barData: PropTypes.object.isRequired,
}

