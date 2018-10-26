const { series, src, dest } = require('gulp');
const rename = require('gulp-rename');
const { sh } = require('sh-thunk');
const fs = require('fs');

const mainOutputDir = './dist';
const viewRequestConfig = {
  outputDir: `${mainOutputDir}/viewer-request-function`,
  srcFile: 'src/viewerRequest.js',
  dependencies: ['querystring'],
  outputName: 'index',
};

const originResponseConfig = {
  outputDir: `${mainOutputDir}/origin-response-function`,
  srcFile: 'src/originResponse.js',
  dependencies: ['sharp'],
  outputName: 'index',
};

const createDistFn = (config) => {
  const { srcFile, outputDir, outputName } = config;
  return () => src(srcFile)
    .pipe(rename({ basename: outputName }))
    .pipe(dest(outputDir))
};

const initViewRequest = async () => {
  const { outputDir, dependencies } = viewRequestConfig;
  await sh`
    cd ${outputDir}
    npm init -y
    npm install --save ${dependencies.join(' ')}
    cd ..
  `();
}

const initOriginResponse = async () => {
  const { outputDir, dependencies } = originResponseConfig;
  await sh`
    cd ${outputDir}
    npm init -y
    npm install --save ${dependencies.join(' ')}
  `();
}

const zipViewerRequest = async () => {
  return sh`
    cd ${viewRequestConfig.outputDir}
    zip -r viewer-request-function.zip *
    mv viewer-request-function.zip ../
  `();
};

const zipOriginResponse = async () => {
  return sh`
    cd ${originResponseConfig.outputDir}
    zip -r origin-response-function.zip *
    mv origin-response-function.zip ../
  `();
};

exports.zip = async () => {
  await zipViewerRequest();
  await zipOriginResponse();
}

exports.default = series(
  createDistFn(viewRequestConfig),
  createDistFn(originResponseConfig),
  initViewRequest,
  initOriginResponse
);