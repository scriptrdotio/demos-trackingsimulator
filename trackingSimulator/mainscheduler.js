var mainorchestration = require("./mainorchestration");

try {
  mainorchestration.orchestrate();
}catch(exception) {
 
  log.error(JSON.stringify(exception));
  return exception;
}

