'use strict';
const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

/**
 * Run a pod to build the api image stream.
 *
 * @param {*} settings
 */
module.exports = settings => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = 'build';

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases.build.namespace }, options));

  const changeId = phases[phase].changeId;
  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../../openshift'));

  const objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/api.bc.yaml`, {
      param: {
        NAME: phases[phase].name,
        SUFFIX: phases[phase].suffix,
        VERSION: phases[phase].tag,
        SOURCE_REPOSITORY_URL: oc.git.http_url,
        SOURCE_REPOSITORY_REF: phases[phase].branch || oc.git.ref
      }
    })
  );

  oc.applyRecommendedLabels(objects, phases[phase].name, phase, changeId, phases[phase].instance);
  oc.applyAndBuild(objects);
};
