import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

let query = '';
let selectedYear = null;

const colors = d3.scaleOrdinal(d3.schemeTableau10);

if (projectsTitle && projects) {
  projectsTitle.textContent = `${projects.length} Projects`;
}

function getSearchFilteredProjects() {
  return projects.filter((project) => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

function getFinalFilteredProjects() {
  return getSearchFilteredProjects().filter((project) => {
    return selectedYear === null || String(project.year) === String(selectedYear);
  });
}

function renderPieChart(projectsGiven) {
  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');

  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  const rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  const data = rolledData.map(([year, count]) => {
    return {
      label: year,
      value: count,
    };
  });

  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const sliceGenerator = d3.pie().value((d) => d.value);

  const arcData = sliceGenerator(data);
  const arcs = arcData.map((d) => arcGenerator(d));

  arcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .attr('class', data[i].label === selectedYear ? 'selected' : '')
      .on('click', () => {
        selectedYear = selectedYear === data[i].label ? null : data[i].label;
        updatePage();
      });
  });

  data.forEach((d, i) => {
    legend
      .append('li')
      .attr('style', `--color: ${colors(i)}`)
      .attr('class', d.label === selectedYear ? 'legend-item selected' : 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedYear = selectedYear === d.label ? null : d.label;
        updatePage();
      });
  });
}

function updatePage() {
  const searchFilteredProjects = getSearchFilteredProjects();
  const finalFilteredProjects = getFinalFilteredProjects();

  renderProjects(finalFilteredProjects, projectsContainer, 'h2');
  renderPieChart(searchFilteredProjects);
}

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  updatePage();
});

updatePage();