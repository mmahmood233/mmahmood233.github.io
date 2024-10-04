function fetchUserData() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        showLoginView();
        return;
    }

    const query = `
    {
        user {
            id
            login
            totalUp
            totalDown
            auditRatio
            transactions(where: {type: {_eq: "xp"}}, order_by: {createdAt: asc}) {
                amount
                createdAt
            }
        }
        event_user(where: {eventId: {_eq: 20}}) {
            level
        }
    }
    `;

    fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        return response.json();
    })
    .then(data => displayUserData(data.data))
    .catch(error => {
        console.error('Error:', error);
        showLoginView();
    });
}

function displayUserData(data) {
    const user = data.user[0];
    const level = data.event_user[0]?.level || 'N/A';

    document.getElementById('user-name').textContent = user.login;
    document.getElementById('user-level').textContent = level;
    document.getElementById('user-icon').src = `https://avatars.githubusercontent.com/${user.login}`;

    createSkillsRadarChart(user.transactions);
    updateAuditRatio(user.totalUp, user.totalDown, user.auditRatio);
}

function updateAuditRatio(totalUp, totalDown, auditRatio) {
    const doneBar = document.getElementById('done-bar');
    const receivedBar = document.getElementById('received-bar');
    const doneValue = document.getElementById('done-value');
    const receivedValue = document.getElementById('received-value');
    const ratioValue = document.getElementById('audit-ratio-value');
    const ratioMessage = document.getElementById('audit-message');

    const maxValue = Math.max(totalUp, totalDown);
    
    doneBar.style.width = `${(totalUp / maxValue) * 100}%`;
    receivedBar.style.width = `${(totalDown / maxValue) * 100}%`;
    
    doneValue.textContent = Math.round(totalUp / 1000);
    receivedValue.textContent = Math.round(totalDown / 1000);
    
    ratioValue.textContent = auditRatio.toFixed(1);
    
    if (auditRatio < 1) {
        ratioMessage.textContent = "You can do better!";
    } else if (auditRatio === 1) {
        ratioMessage.textContent = "Perfect balance!";
    } else {
        ratioMessage.textContent = "Great job!";
    }
}

function fetchUserData() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        showLoginView();
        return;
    }

    const query = `
    {
        user {
            id
            login
            totalUp
            totalDown
            auditRatio
            transactions(where: {type: {_eq: "xp"}}, order_by: {createdAt: desc}, limit: 10) {
                amount
                createdAt
                path
            }
        }
        event_user(where: {eventId: {_eq: 20}}) {
            level
        }
    }
    `;

    fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        return response.json();
    })
    .then(data => displayUserData(data.data))
    .catch(error => {
        console.error('Error:', error);
        showLoginView();
    });
}

function displayUserData(data) {
    const user = data.user[0];
    const level = data.event_user[0]?.level || 'N/A';

    document.getElementById('user-name').textContent = user.login;
    document.getElementById('user-level').textContent = level;
    document.getElementById('user-icon').src = `https://avatars.githubusercontent.com/${user.login}`;

    updateAuditRatio(user.totalUp, user.totalDown, user.auditRatio);
    displayTransactionHistory(user.transactions);
    createAuditChart(user.totalUp, user.totalDown);
    createXPProgressChart(user.transactions);
}

function displayTransactionHistory(transactions) {
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';

    transactions.forEach(transaction => {
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-item';

        const projectName = transaction.path.split('/').pop().replace(/-/g, ' ');
        const amount = (transaction.amount / 1000).toFixed(1);
        const date = new Date(transaction.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });

        transactionItem.innerHTML = `
            <div class="transaction-project">Project — ${projectName}</div>
            <div class="transaction-amount">${amount} kB</div>
            <div class="transaction-date">${date}</div>
        `;

        transactionList.appendChild(transactionItem);
    });
}

function createAuditChart(totalUp, totalDown) {
    console.log("Creating audit chart with:", { totalUp, totalDown });

    // Convert bytes to kilobytes
    const totalUpKB = totalUp / 1000;
    const totalDownKB = totalDown / 1000;

    const width = 300;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 60 };

    d3.select("#audit-chart").selectAll("*").remove();

    const svg = d3.select("#audit-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .range([0, width - margin.left - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .range([height - margin.top - margin.bottom, 0]);

    const data = [
        { label: "Done", value: totalUpKB },
        { label: "Received", value: totalDownKB }
    ];

    x.domain(data.map(d => d.label));
    y.domain([0, Math.max(totalUpKB, totalDownKB)]);

    console.log("Y domain (kB):", y.domain());

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.label))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.value))
        .attr("height", d => height - margin.top - margin.bottom - y(d.value))
        .attr("fill", (d, i) => i === 0 ? "#4CAF50" : "#2196F3");

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y)
            .ticks(5)
            .tickFormat(d => d3.format(",.0f")(d))); // Format as integer

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("kB");
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// This function should be defined in your main.js or wherever you handle view switching
function showLoginView() {
    // Implementation depends on your specific setup
    console.log("Showing login view");
    // You might want to redirect to login page or show/hide specific elements
}

function createXPProgressChart(transactions) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.getElementById('xp-chart');
    svg.setAttribute("width", "400");
    svg.setAttribute("height", "200");

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 400 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    // Clear existing content
    svg.innerHTML = '';

    // Sort transactions by date
    transactions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Calculate cumulative XP
    let cumulativeXP = 0;
    const data = transactions.map(t => {
        cumulativeXP += t.amount;
        return { date: new Date(t.createdAt), xp: cumulativeXP };
    });

    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.xp)])
        .range([height, 0]);

    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.xp));

    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("transform", `translate(${margin.left},${margin.top})`);
    svg.appendChild(g);

    // Create the line path
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", line(data));
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "steelblue");
    g.appendChild(path);

    // Create x-axis
    const xAxis = document.createElementNS(svgNS, "g");
    xAxis.setAttribute("transform", `translate(0,${height})`);
    g.appendChild(xAxis);

    // Create y-axis
    const yAxis = document.createElementNS(svgNS, "g");
    g.appendChild(yAxis);

    // Use D3 to render the axes
    d3.select(xAxis).call(d3.axisBottom(xScale));
    d3.select(yAxis).call(d3.axisLeft(yScale));
}