const apiKey = `1FyswLynq7PUOTS5dzBJ`;
const streetName = 'university crescent'
const streetUrl = `https://api.winnipegtransit.com/v3/streets.json?api-key=1FyswLynq7PUOTS5dzBJ&name=${streetName}&usage=long`;

const getData = async(url) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

const getStreets = async() => {
  const streetData = await getData(streetUrl);
  const streetsArray = streetData.streets;
  return streetsArray;
}

const getStops = async() => {
  const streetsArray = await getStreets();
  const stopUrl = `https://api.winnipegtransit.com/v3/stops.json?api-key=1FyswLynq7PUOTS5dzBJ&street=${streetsArray[0].key}&usage=long`;
  const stopData = await getData(stopUrl);
  const stopsArray = stopData.stops;
  return stopsArray;
}

const getStopsSchedule = async() => {
  const stopsArray = await getStops();
  const stopsSchedulePromises = [];
  stopsArray.forEach(stop => {
    const stopScheduleUrl = `https://api.winnipegtransit.com/v3/stops/${stop.key}/schedule.json?api-key=1FyswLynq7PUOTS5dzBJ&max-results-per-route=2`;
    const stopScheduleData = getData(stopScheduleUrl);
    stopsSchedulePromises.push(stopScheduleData);
  });
  return await Promise.all(stopsSchedulePromises);
}

const render = async() => {
  const streetsArray = await getStreets();
  renderStreets(streetsArray);
  const scheduleArray = await getStopsSchedule();
  renderSchedule(scheduleArray);
}

const renderSchedule = (scheduleArray) => {
  const scheduleContainer = document.querySelector('.schedule-container');
  scheduleArray.forEach(schedule => {
    scheduleContainer.insertAdjacentHTML('beforeend',
    `
    <tr>
      <td>${schedule['stop-schedule'].stop.name}</td>
      <td>${schedule['stop-schedule'].stop['cross-street'].name}</td>
      <td>${schedule['stop-schedule'].stop.direction}</td>
      <td>${schedule['stop-schedule']['route-schedules'][0].route.number}</td>
      <td>${schedule['stop-schedule']['route-schedules'][0]['scheduled-stops'][0].times.arrival.scheduled}</td>
    </tr>
    `)
  })
}

const renderStreets = (streetsArray) => {
  const streets = document.querySelector('.streets');
  streetsArray.forEach(street => {
    streets.insertAdjacentHTML('beforeend', 
    `
    <a href="#" data-street-key="${street.key}">${street.name}</a>
    `);
  });
}
render();

















/*getData(streetUrl).then(streetData => {
  const streetsArray = streetData.streets;
  return streetsArray;
}).then(streetsArray => {
  console.log(streetsArray)
  const stopUrl = `https://api.winnipegtransit.com/v3/stops.json?api-key=1FyswLynq7PUOTS5dzBJ&street=${streetsArray[0].key}&usage=long`;
  getData(stopUrl).then(stopData => {
    const stopArray = stopData.stops;
    return stopArray;
  }).then(stopArray => {
    console.log(stopArray);
    stopArray.forEach(stop => {
      const stopScheduleUrl = `https://api.winnipegtransit.com/v3/stops/${stop.key}/schedule.json?api-key=1FyswLynq7PUOTS5dzBJ&max-results-per-route=2`;
    getData(stopScheduleUrl).then(stopScheduleData => {
      console.log(stopScheduleData['stop-schedule']);
    })
    })
  })
})*/

/* stopScheduleData['stop-schedule'].stop.name
  stopScheduleData['stop-schedule'].stop.direction
  stopScheduleData['stop-schedule'].stop.street.name
  stopScheduleData['stop-schedule'].stop['cross-street'].name
  stopScheduleData['stop-schedule']['route-schedules'][0].route.number
  stopScheduleData['stop-schedule']['route-schedules'][0]['scheduled-stops'][0].times.arrival.scheduled*/ 