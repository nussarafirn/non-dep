
function monthAggregate(country, objPercentMisDep) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    function parseMonth(m) {
        return new Date(parseInt('20' + m.split('-')[1]), monthNames.indexOf(m.split('-')[0]));
    }


    const group = {};
    objPercentMisDep.map(datum => {
        if (country !== 'All' && datum['ADEP State'] !== country) return;
        if (!(datum['Month'] in group)) {
            group[datum['Month']] = [];
        }
        group[datum['Month']].push(datum);
    });

    const d = Object.entries(group).map(([m, values]) => {
        let MisDep = 0;
        let TotalDep = 0;

        values.forEach(function (value) {
            MisDep += value['MisDep'];
            TotalDep += value['TotalDep'];
        });

        const PercentMisDep = (Math.round((MisDep / TotalDep) * 10000) / 100);
        return {
            month: parseMonth(m),
            monthStr: m.split('-')[0] + ' 20' + m.split('-')[1],
            percentMisDep: PercentMisDep,
            misDep: MisDep,
        };
    });
    return d.sort((a, b) => a.month - b.month);
}


function createMonthConfig(monthData) {

    return {
        type: 'bar',
        data: {
            labels: monthData.map(d => d.monthStr),
            datasets: [
                {
                    label: 'Total # MIS Flights',
                    data: monthData.map(d => d.misDep),
                    backgroundColor: transparentize(CHART_COLORS.red, .5),
                    borderColor: CHART_COLORS.red,
                    borderWidth: 1,
                    order: 1,
                    yAxisID: 'barAxis',
                    datalabels: {
                        color: 'black',
                        backgroundColor: null,
                        font: { size: 18 }
                    }
                },
                {
                    label: '% MIS',
                    data: monthData.map(d => d.percentMisDep),
                    borderColor: CHART_COLORS.red,
                    backgroundColor: CHART_COLORS.red,
                    type: 'line',
                    order: 0,
                    yAxisID: 'lineAxis',
                    datalabels: {
                        color: 'white',
                        align: 'auto',
                        formatter: (v) => v + '%',
                        backgroundColor: function (context) {
                            return context.dataset.backgroundColor;
                        },
                    }
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: null,
                title: null,
                datalabels: {
                    borderRadius: 4,
                    // font: { weight: 'bold' },
                    padding: 4
                }
            },
            scales: {
                barAxis: { type: 'linear', display: true, position: 'left' },
                lineAxis: { type: 'linear', display: false, position: 'right', grid: { drawOnChartArea: false } },
            }
        },
    };
}