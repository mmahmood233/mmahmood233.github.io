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

    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    d3.select("#xp-graph").selectAll("*").remove();

    const svg = d3.select("#xp-graph")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d.date)))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.xp)])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    const line = d3.line()
        .x(d => x(new Date(d.date)))
        .y(d => y(d.xp));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#3498db")
        .attr("stroke-width", 2)
        .attr("d", line);
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

    d3.select("#project-success-graph").selectAll("*").remove();

    const svg = d3.select("#project-success-graph")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.status))
        .range(['#2ecc71', '#e74c3c']);

    const pie = d3.pie()
        .value(d => d.count);

    const arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.8);

    const outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    const arcs = svg.selectAll('arc')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'arc');

    arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.status))
        .attr("stroke", "white")
        .style("stroke-width", "2px");

    arcs.append('text')
        .attr('transform', d => {
            const pos = outerArc.centroid(d);
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            pos[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
            return `translate(${pos})`;
        })
        .attr('dy', '.35em')
        .style('text-anchor', d => {
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            return midangle < Math.PI ? 'start' : 'end';
        })
        .text(d => `${d.data.status}: ${d.data.count}`);
}