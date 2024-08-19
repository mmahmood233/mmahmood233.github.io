function createXPGraph(transactions) {
    const xpData = transactions
        .filter(t => t.type === 'xp')
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .reduce((acc, t) => {
            const date = new Date(t.createdAt).toLocaleDateString();
            acc[date] = (acc[date] || 0) + t.amount;
            return acc;
        }, {});

    const data = Object.entries(xpData).map(([date, xp]) => ({ date, xp }));

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d.date)))
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.xp)])
        .range([innerHeight, 0]);

    const line = d3.line()
        .x(d => xScale(new Date(d.date)))
        .y(d => yScale(d.xp));

    const svg = d3.select('#xp-graph')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', line);

    g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));

    g.append('g')
        .call(d3.axisLeft(yScale));

    g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .text('XP Earned Over Time');
}

function createProjectSuccessGraph(progresses) {
    const projectData = progresses
        .filter(p => p.object.type === 'project')
        .reduce((acc, p) => {
            const status = p.grade > 0 ? 'PASS' : 'FAIL';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, { PASS: 0, FAIL: 0 });

    const data = Object.entries(projectData).map(([status, count]) => ({ status, count }));

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.status))
        .range(['#4daf4a', '#e41a1c']);

    const pie = d3.pie()
        .value(d => d.count);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const svg = d3.select('#project-success-graph')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

    const arcs = svg.selectAll('arc')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'arc');

    arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.status));

    arcs.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .text(d => `${d.data.status}: ${d.data.count}`);

    svg.append('text')
        .attr('x', 0)
        .attr('y', -height / 2 + 20)
        .attr('text-anchor', 'middle')
        .text('Project Success Rate');
}