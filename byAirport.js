function airportAggregate(country, month, objPercentMisDep) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    function parseMonth(m) {
        return new Date(parseInt('20' + m.split('-')[1]), monthNames.indexOf(m.split('-')[0]));
    }


    const allMonthsSet = new Set();
    const group = {};
    objPercentMisDep.map(datum => {
        // if (datum['ADEP State'] !== 'Malaysia') return;
        if (country !== 'All' && datum['ADEP State'] !== country) return;
        if (month && month !== 'All' && !month.has(datum['Month'])) return;

        if (!(datum['Month'] + '___' + datum['ADEP'] in group)) {
            group[datum['Month'] + '___' + datum['ADEP']] = [];
        }
        group[datum['Month'] + '___' + datum['ADEP']].push(datum);

        allMonthsSet.add(datum['Month']);
    });

    // TODO: should include months in between that are missing.
    const allMonths = [...allMonthsSet].sort((a, b) => parseMonth(a) - parseMonth(b));

    const d = {}
    Object.entries(group).forEach(([key, values]) => {
        let MisDep = 0;
        let TotalDep = 0;

        values.forEach(function (value) {
            MisDep += value['MisDep'];
            TotalDep += value['TotalDep'];
        });

        const PercentMisDep = (Math.round((MisDep / TotalDep) * 10000) / 100);
        const [month, ADEP] = key.split('___');

        if (!(ADEP in d)) {
            d[ADEP] = new Array(allMonths.length).fill(null);
        }

        const mIndex = allMonths.indexOf(month);
        if (mIndex === -1 || d[ADEP][mIndex]) {
            console.error('Error', mIndex, d[ADEP][mIndex]);
            throw Error();
        }

        d[ADEP][mIndex] = {
            month: parseMonth(month),
            ADEP: ADEP,
            percentMisDep: PercentMisDep,
            misDep: MisDep,
        };
    });
    return [d, allMonths];
}


function createAirportDataset(ADEP, values, idx) {
    return {
        label: ADEP,
        data: values ? values.map(d => d?.percentMisDep) : null,
        borderColor: Object.values(CHART_COLORS)[idx % Object.keys(CHART_COLORS).length],
        backgroundColor: Object.values(CHART_COLORS)[idx % Object.keys(CHART_COLORS).length],
        order: idx,
        yAxisID: 'y',
        datalabels: {
            color: 'white', align: 'end',
            formatter: (v) => v + '%',
        }
    };
}


function createAirportConfig(airportData, airportAllMonths) {

    return {
        type: 'line',
        data: {
            labels: airportAllMonths.map(m => m.split('-')[0] + ' 20' + m.split('-')[1]),
            datasets: Object.entries(airportData).map(([ADEP, values], idx) => createAirportDataset(ADEP, values, idx))
        },
        options: {
            responsive: true,
            plugins: {
                // legend: null,
                // title: null,
                datalabels: {
                    backgroundColor: function (context) {
                        return context.dataset.backgroundColor;
                    },
                    borderRadius: 4,
                    color: 'white',
                    padding: 4,
                    display: function (context) {
                        return context.dataset.data[context.dataIndex] !== 100;
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        },
    };
}