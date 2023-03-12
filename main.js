// set up 
// **** Example of how to create padding and spacing for city plot****
var svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object
// This will space out the city subplots
var padding = {t: 20, r: 20, b: 60, l: 60};

// Compute the dimensions of the city plots, assuming a 2x2 layout matrix.
cityWidth = svgWidth / 2 - padding.l - padding.r;
cityHeight = svgHeight / 4 - padding.t - padding.b;

svg.selectAll('.background')
    .data(['A', 'B', 'C']) // dummy data
    .enter()
    .append('rect') // Append 4 rectangles
    .attr('class', 'background')
    .attr('width', cityWidth) // Use our city dimensions
    .attr('height', cityHeight)
    .attr('transform', function(d, i) {
        // Position based on the matrix array indices.
        // i = 1 for column 1, row 0)
        var tx = (i % 2) * (cityWidth + padding.l + padding.r) + padding.l;
        var ty = Math.floor(i / 2) * (cityHeight + padding.t + padding.b) + padding.t;
        return 'translate('+[tx, ty]+')';
    });

// To speed things up, we have already computed the domains for your scales
var precipitationDomain = [0, 0.4];

var parseDate = d3.timeParse('%m/%d/%Y');

// load data from CSV file 
d3.csv('update_data.csv').then(function(dataset) {
    // parse the date 
    dataset.forEach(function(row) {
        row.date = parseDate(row.date);
    })

    // 3. Nest the loaded dataset 
    var nested = d3.nest()
                    .key(function(c) {
                        return c.city;
                                     })
                    .entries(dataset)
                
console.log(nested);

    // Create city groups
    var cityG = svg.selectAll('.city')
    .data(nested)
    .enter()
    .append('g')
    .attr('class', 'city')
    .attr('transform', function(d, i) {
        var tx = (i % 2) * (cityWidth + padding.l + padding.r) + padding.l;
        var ty = Math.floor(i / 2) * (cityHeight + padding.t + padding.b) + padding.t;
        return 'translate(' + [tx, ty] + ')';
    })

    // scales 
    var dateDomain = [new Date(2015, 0), new Date(2015, 6)];

                    minMonth = d3.min(nested, (item) => {
                        return item['month']
                    })
                    maxMonth = d3.max(nested, (item) => {
                        return item['month']
                    })
            
    // set up the x-axis length
    xScale = d3.scaleTime()
                .domain(dateDomain)
                .range([0, cityWidth])
        
    var yScale = d3.scaleLinear().domain(precipitationDomain).range([cityHeight, 0])
    
    var lineInterpolate = d3.line()
        .x(function(d) {
            return xScale(d.date);
        })
        .y(function(d) {
            return yScale(d.average_precipitation);
        });

    xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.timeFormat('%B'))

    yAxis = d3.axisLeft(yScale)

    // x-axis 
    cityG.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + cityHeight + ')')
    .call(xAxis)

    // x label 
    cityG.append('text')
    .attr('class', 'x axis-label')
    .attr('transform', 'translate(' + cityWidth / 2 +', ' + (cityHeight + 34) + ')')
    .text('Month(Jan - July)')

    //  x grid
    var xGrid = d3.axisTop(xScale)
    .tickSize(-cityHeight, 0, 0)
    .tickFormat('');

    cityG.append('g')
    .attr('class', 'x grid')
    .call(xGrid)

    // y-axis 
    cityG.append('g')
    .attr('class', 'y axis')
    .call(yAxis)

    // y label 
    cityG.append('text')
    .attr('class', 'y axis-label')
    .attr('transform', 'translate(-35, ' + cityHeight / 2 + ') rotate(-90)')
    .text('Precipitation')
    
    // y grid 
        var yGrid = d3.axisLeft(yScale)
            .tickSize(-cityWidth, 0, 0)
            .tickFormat('')

        cityG.append('g')
            .attr('class', 'y grid')
            .call(yGrid)

            
    // color 
       var colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(nested.map(d => d.city))

    // line chart
    var newG = cityG.selectAll('.line-plot')
    .data(function(d) {
        return [d.values];
    })
    .enter()
    .append('path')
    .attr('class', 'line-plot')
    .attr('d', lineInterpolate)
    .style('stroke', function(d) {
        return colorScale(d[1].city);
    })

    cityG.append('text')
        .attr('class', 'city-label')
        .text(function(d) {
            return d.key;
        })
        .attr('transform', 'translate(' + cityWidth / 2 +',' + cityHeight / 2 + ')')
        .style('stroke', function(d) {
            return colorScale(d.key);
        })

    })