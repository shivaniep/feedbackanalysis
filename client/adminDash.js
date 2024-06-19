document.addEventListener('DOMContentLoaded', function() {
    const userId = localStorage.getItem('userId');
    if (userId) {
        document.getElementById('user-id-display').textContent = userId;
    } else {
        console.error('User ID not found in localStorage');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const userId = localStorage.getItem('userId');
    if (userId) {
        document.getElementById('user-id-display').textContent = userId;
    } else {
        console.error('User ID not found in localStorage');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    function populateFacultyList(semester) {
        const facultyListContainer = document.querySelector('.frame2-content');
        if (!facultyListContainer) {
            console.error('facultyListContainer not found');
            return;
        }
        
        facultyListContainer.innerHTML = '';

        const adminFacultyData = JSON.parse(localStorage.getItem('facultyData'));

        if (adminFacultyData && adminFacultyData[semester]) {
            const facultyList = adminFacultyData[semester];
            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <caption>FACULTY LIST</caption><br>
                    <tr>
                        <th>S.No</th>
                        <th>Faculty ID</th>
                        <th>Faculty Name</th>
                    </tr>
                </thead>
                <tbody>
                    ${facultyList.map((faculty, index) => `
                        <tr class="faculty-item" data-faculty-id="${faculty.id}" data-faculty-name="${faculty.name}">
                            <td>${index + 1}</td>
                            <td>${faculty.id}</td>
                            <td>${faculty.name}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            facultyListContainer.appendChild(table);

            const facultyItems = document.querySelectorAll('.faculty-item');
            facultyItems.forEach(item => {
                item.addEventListener('click', function() {
                    const facultyId = this.dataset.facultyId;
                    const facultyName = this.dataset.facultyName;
                    getFacultyAnalysis(facultyId, facultyName);
                });
            });
        } else {
            console.error('Faculty data for selected semester not found');
        }
    }

    function getFacultyAnalysis(facultyId, facultyName) {
        fetch(`http://localhost:3000/getFacultyAnalysis?faculty_id=${facultyId}`)
            .then(response => response.json())
            .then(data => {
                console.log(`Faculty ID: ${facultyId}, Analysis:`, data);

                const visualizationContainer = document.querySelector('.visualisation');
                visualizationContainer.innerHTML = '';

                const closeButton = document.createElement('button');
                closeButton.textContent = '✖';
                closeButton.style.position = 'absolute';
                closeButton.style.top = '10px';
                closeButton.style.right = '10px';
                closeButton.style.border = 'none';
                closeButton.style.background = 'none';
                closeButton.style.fontSize = '20px';
                closeButton.style.cursor = 'pointer';
                closeButton.addEventListener('click', function() {
                    visualizationContainer.innerHTML = '';
                });
                visualizationContainer.appendChild(closeButton);
                
                const description = document.createElement('div');
                description.innerHTML = `<b>Faculty ID:</b> ${facultyId} <br> <b>Faculty Name:</b> ${facultyName}`;
                description.style.fontSize = '16px';
                description.style.marginBottom = '20px';
                visualizationContainer.appendChild(description);
                
                const chartTitle = document.createElement('div');
                chartTitle.textContent = 'Sentiment Analysis Breakdown';
                chartTitle.style.fontWeight = 'bold';
                chartTitle.style.fontSize = '20px';
                chartTitle.style.textAlign = 'center';
                chartTitle.style.marginBottom = '10px';
                visualizationContainer.appendChild(chartTitle);

                const analysisData = data.map(item => ({
                    label: item.output_label,
                    count: item.count
                }));

                const width = 400;
                const height = 400;
                const radius = Math.min(width, height) / 2;

                const color = d3.scaleOrdinal()
                    .domain(analysisData.map(d => d.label))
                    .range(['#66c2a5', '#fc8d62', '#8da0cb']); 

                const arc = d3.arc()
                    .outerRadius(radius - 10)
                    .innerRadius(0);

                const pie = d3.pie()
                    .sort(null)
                    .value(d => d.count);

                const svg = d3.select('.visualisation')
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height)
                    .append('g')
                    .attr('transform', `translate(${width / 2},${height / 2})`);

                const defs = svg.append('defs');
                const filter = defs.append('filter')
                    .attr('id', 'drop-shadow')
                    .attr('height', '130%');
                filter.append('feGaussianBlur')
                    .attr('in', 'SourceAlpha')
                    .attr('stdDeviation', 3)
                    .attr('result', 'blur');
                filter.append('feOffset')
                    .attr('in', 'blur')
                    .attr('dx', 2)
                    .attr('dy', 2)
                    .attr('result', 'offsetBlur');

                const feMerge = filter.append('feMerge');
                feMerge.append('feMergeNode')
                    .attr('in', 'offsetBlur');
                feMerge.append('feMergeNode')
                    .attr('in', 'SourceGraphic');

                const g = svg.selectAll('.arc')
                    .data(pie(analysisData))
                    .enter().append('g')
                    .attr('class', 'arc');

                g.append('path')
                    .attr('d', arc)
                    .style('fill', d => color(d.data.label))
                    .style('filter', 'url(#drop-shadow)')
                    .style('cursor', 'pointer')
                    .on('mouseover', function(d) {
                        d3.select(this)
                            .style('opacity', 0.9);
                    })
                    .on('mouseout', function(d) {
                        d3.select(this)
                            .style('opacity', 1);
                    });

                g.append('text')
                    .attr('transform', d => `translate(${arc.centroid(d)})`)
                    .attr('dy', '.35em')
                    .style('text-anchor', 'middle')
                    .style('font-size', '14px')
                    .style('font-weight', 'bold')
                    .text(d => d.data.label);

                const legend = svg.selectAll('.legend')
                    .data(analysisData.map(d => d.label))
                    .enter().append('g')
                    .attr('class', 'legend')
                    .attr('transform', (d, i) => `translate(${width / 2 + 120},${-height / 2 + i * 20})`);

                legend.append('rect')
                    .attr('x', 0)
                    .attr('width', 18)
                    .attr('height', 18)
                    .style('fill', color);

                legend.append('text')
                    .attr('x', 24)
                    .attr('y', 9)
                    .attr('dy', '.35em')
                    .style('text-anchor', 'start')
                    .text(d => d);

                visualizationContainer.classList.add('visible');
                const facultyListContainer = document.querySelector('.frame2-content');
                facultyListContainer.classList.add('slide-left');

                const showMoreButton = document.createElement('button');
                showMoreButton.textContent = 'Show More';
                showMoreButton.style.display = 'block';
                showMoreButton.style.margin = '20px auto';
                visualizationContainer.appendChild(showMoreButton);

                showMoreButton.addEventListener('click', function() {
                    getMoreAnalyzedReport(facultyId);
                });

                export2pdf.addEventListener('click', function() {
                    exportReportAsPDF(visualizationContainer);
                });

            })
            .catch(error => {
                console.error('Error fetching or processing data:', error);
            });
    }
    
    const closeButton = document.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            const visualizationContainer = document.querySelector('.visualisation');
            visualizationContainer.classList.remove('visible');
            const facultyListContainer = document.querySelector('.frame2-content');
            facultyListContainer.classList.remove('slide-left');
        });
    }

    function getMoreAnalyzedReport(facultyId) {
        fetch(`http://localhost:3000/getWordFrequencies?faculty_id=${facultyId}`)
            .then(response => response.json())
            .then(data => {
                console.log('Frequent Words:', data);

                const visualizationContainer = document.querySelector('.visualisation');

                const wordCloudContainer = document.createElement('div');
                wordCloudContainer.style.textAlign = 'center';
                wordCloudContainer.style.marginTop = '20px';
                
                const title = document.createElement('span');
                title.textContent = 'Some Frequent words used:';
                title.style.fontSize = '15px';
                wordCloudContainer.appendChild(title);

                const lineBreak = document.createElement('br');
                wordCloudContainer.appendChild(lineBreak);

                data.forEach(item => {
                    const word = document.createElement('span');
                    word.textContent = `${item[0]} (${item[1]}) `;
                    word.style.fontSize = `${10 + item[1] * 2}px`;
                    wordCloudContainer.appendChild(word);
                });

                visualizationContainer.appendChild(wordCloudContainer);
                const export2pdf = document.createElement('button');
                export2pdf.textContent = 'Export as PDF';
                export2pdf.style.display = 'block';
                export2pdf.style.margin = '20px auto';
                visualizationContainer.appendChild(export2pdf);

                export2pdf.addEventListener('click', function() {
                    exportReportAsPDF(visualizationContainer);
                });

            })
            .catch(error => {
                console.error('Error fetching frequent words:', error);
            });
    }

    function exportReportAsPDF() {
        const visualizationContainer = document.querySelector('.visualisation');
        const contentToExport = visualizationContainer.innerHTML;
        const options = { format: 'Letter' };
        html2pdf().from(contentToExport).set(options).save('visualization.pdf');
    }

    const semesterItems = document.querySelectorAll('.semester-item');
    semesterItems.forEach(item => {
        item.addEventListener('click', function() {
            const selectedSemester = parseInt(this.dataset.semester); 
            populateFacultyList(selectedSemester);
        });
    });


    populateFacultyList(1); 

    document.querySelector('.logout').addEventListener('click', () => {
        window.location.href='adminlogin.html';
    });

});
