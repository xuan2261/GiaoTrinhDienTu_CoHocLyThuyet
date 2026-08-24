(function initMediaPilotRuntime(global) {
  'use strict';

  const entries = [
    {
      id: 'media-ch1-force-sliding',
      localObjectiveId: 'obj-ch1-force-sliding',
      title: 'Trượt lực trên đường tác dụng',
      modality: 'animated-figure',
      prototypePath: 'prototypes/media/force-sliding.html',
      staticFallbackPath: 'prototypes/media/assets/force-sliding-poster.png',
      reducedMotionMode: 'static'
    },
    {
      id: 'media-ch1-resultant-angle',
      localObjectiveId: 'obj-ch1-resultant-angle',
      title: 'Độ lớn hợp lực theo góc',
      modality: 'quantitative-chart',
      prototypePath: 'prototypes/media/resultant-angle-chart.html',
      staticFallbackPath: 'prototypes/media/resultant-angle-chart.html#bang-gia-tri',
      reducedMotionMode: 'interactive-without-animation'
    },
    {
      id: 'media-ch1-friction-cone',
      localObjectiveId: 'obj-ch1-friction-cone',
      title: 'Nón ma sát và điều kiện trượt',
      modality: 'mounted-simulation',
      prototypePath: 'prototypes/media/friction-cone-sim2.html',
      staticFallbackPath: 'prototypes/media/friction-cone-sim2.html#phuong-an-tinh',
      reducedMotionMode: 'interactive-without-animation'
    },
    {
      id: 'media-ch1-centroid-steps',
      localObjectiveId: 'obj-ch1-centroid-steps',
      title: 'Lập luận trọng tâm phần khoét',
      modality: 'step-interaction',
      prototypePath: 'prototypes/media/centroid-reasoning.html',
      staticFallbackPath: 'prototypes/media/centroid-reasoning.html#loi-giai-tinh',
      reducedMotionMode: 'interactive-without-animation'
    }
  ];

  global.MEDIA_PILOT_RUNTIME = Object.freeze({
    schemaVersion: '1.0.0',
    status: 'pilot-draft',
    entries: Object.freeze(entries.map(entry => Object.freeze(entry)))
  });
})(window);
