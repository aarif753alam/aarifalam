fetch('../json/config.json')
  .then(res => res.json())
  .then(data => {
    const config = data;
    console.log(config.totalLevels, config.levelRules);
  });
