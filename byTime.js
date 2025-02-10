function timeAggregate(country, month, FlightType) {
    const FLIGHT_TYPES = ['Overflight', 'Inbound'];
    const allHours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

    const timeData = {};
    FlightType.map(datum => {
        if (country !== 'All' && datum['ADEP State'] !== country) return;
        if (month && month !== 'All' && !(month.has(datum['Month']))) return;

        const flightType = datum['FlightType'];
        const hour = datum['HourEOBT'];
        const idx = parseInt(hour)

        if (!(flightType in timeData)) {
            timeData[flightType] = new Array(allHours.length).fill(0);
        }
        timeData[flightType][idx] += datum['TotalFlights'];
    });

    return {
        timeAllHours: allHours,
        timeFlightTypes: FLIGHT_TYPES,
        timeData: timeData,
    }
}

function createTimeConfig(timeAllHours, timeFlightTypes, timeData) {
    return {
        type: 'bar',
        data: {
            labels: timeAllHours,
            datasets: timeFlightTypes.map((flightType, idx) => {
                return {
                    label: flightType,
                    data: timeData[flightType],
                    backgroundColor: transparentize(Object.values(CHART_COLORS)[idx % Object.keys(CHART_COLORS).length], .5),
                    borderColor: Object.values(CHART_COLORS)[idx % Object.keys(CHART_COLORS).length],
                    borderWidth: 1,
                    datalabels: {
                        color: Object.values(CHART_COLORS)[idx % Object.keys(CHART_COLORS).length],
                        clamp: true,
                        align: idx == 0 ? 'center': 'top',
                        anchor: idx == 0 ? 'center': 'end',
                        formatter: (v) => v,
                    }
                };
            })
        },
        options: {
            responsive: true,
            plugins: {
                // legend: null,
                title: null,
                datalabels: {
                    // backgroundColor: function (context) {
                    //     return context.dataset.backgroundColor;
                    // },
                    borderRadius: 4,
                    color: 'white',
                    font: { weight: 'bold' },
                    padding: 4
                }
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true }
            }
        },
    };
}