var myChart;

function updateChart() {

    $('#myChart').remove();
    $('#myChartBody').append('<canvas id="myChart" width="400" height="400"></canvas>');
    var ToSort = {};
    var labels = [];
    Object.keys(CHART_DATA).forEach(d => {
        CHART_DATA[d + " (" + CHART_DATA[d]["count"] + ")"] = CHART_DATA[d]
        delete CHART_DATA[d + " (" + CHART_DATA[d]["count"] + ")"]["count"];
        delete CHART_DATA[d];
    });
    Object.keys(CHART_DATA).forEach(d => {
        var sum = 0;
        Object.values(CHART_DATA[d]).forEach(v => {
            sum = (sum + parseInt(v));
        });
        ToSort[d] = sum;
    });

    
    
    var sortable = Object.fromEntries(
        Object.entries(ToSort).sort(([, b], [, a]) => a - b)
        );


        Object.keys(sortable).forEach(d => {
            var valueToPush = new Array();
            valueToPush[0] = d.split(" ")[0];
            valueToPush[1] = d.split(" ")[1];
            labels.push(valueToPush);
        });

        console.log(labels);

    const ctx = document.getElementById('myChart').getContext('2d');

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad de Usuarios',
                data: Object.values(sortable),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {

            onClick: function (event, clickedElements) {
                if (clickedElements.length === 0) return;
                const {
                    dataIndex,
                    raw
                } = clickedElements[0].element.$context;
                const {
                    backgroundColor,
                    borderColor
                } = clickedElements[0].element.options;
                var barLabel = event.chart.data.labels[dataIndex];
                barLabel = barLabel[0] + " " + barLabel[1];
                console.log(barLabel);
                showDetailChart(barLabel, backgroundColor, borderColor, raw);
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

}

function showDetailChart(label, BACK_COLOR, BORDER_COLOR, n) {
    $('#top10btn').on('click', function () {
        showDetailChart(label, BACK_COLOR, BORDER_COLOR, 10);
    });
    var ToSort = CHART_DATA[label];
    var dataObj = Object.fromEntries(
        Object.entries(ToSort).sort(([, b], [, a]) => a - b)
    );

    $('#myDetailChart').remove();
    $('#myChartDetailBody').append('<canvas id="myDetailChart" width="400" height="400"></canvas>');
    const Dctx = document.getElementById('myDetailChart').getContext('2d');
    const labelss = Object.keys(dataObj).slice(0, n);
    const data = {
        labels: labelss,
        datasets: [{
            axis: 'y',
            label: 'Clases asistidas',
            data: Object.values(dataObj).slice(0, n),
            fill: false,
            backgroundColor: [
                BACK_COLOR
            ],
            borderColor: [
                BORDER_COLOR
            ],
            borderWidth: 1
        }]
    };
    const config = {
        type: 'bar',
        data,
        options: {
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    };
    const dChart = new Chart(Dctx, config);
    $("#modal-assistant-Chart-Detail").modal('show');
}