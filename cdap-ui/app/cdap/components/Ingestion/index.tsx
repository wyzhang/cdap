/*
 * Copyright © 2019 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import * as React from 'react';
import withStyles, { WithStyles, StyleRules } from '@material-ui/core/styles/withStyles';
import PluginList from 'components/Ingestion/PluginList';
import SinkList from 'components/Ingestion/SinkList';
import WidgetRenderer from 'components/Ingestion/PluginWidgetRenderer';
import { MyPipelineApi } from 'api/pipeline';
import If from 'components/If';
import ConfigurationGroup from 'components/ConfigurationGroup';
import { Button, TextField } from '@material-ui/core';
import Helmet from 'react-helmet';

const styles = (): StyleRules => {
  return {
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
    propsRenderBlock: {
      margin: '0 40px',
      width: '40%',
    },
    propsContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    jobInfo: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  };
};

const SOURCE_LIST = ['BigQueryTable', 'Spanner'];
const SINK_LIST = ['BigQueryTable', 'GCS'];
const AVAILABLE_PLUGINS = {
  batchsource: SOURCE_LIST,
  batchsink: SINK_LIST,
};
interface IIngestionProps extends WithStyles<typeof styles> {
  test: string;
  pluginsMap: any;
}

class IngestionView extends React.Component<IIngestionProps> {
  public state = {
    batchsource: [],
    batchsink: [],
    selectedSource: null,
    selectedSink: null,
    sourceBP: null,
    sinkBP: null,
    pipelineName: '',
    publishingPipeline: false,
  };
  public componentDidMount() {
    // MyPipelineApi.fetchPlugins({
    //   namespace: 'default',
    //   pipelineType: 'cdap-data-pipeline',
    //   version: '6.2.0-SNAPSHOT',
    //   extensionType: 'batchsource',
    // }).subscribe((res) => {
    //   res
    //     .filter((plugin) => SOURCE_LIST.includes(plugin.name))
    //     .forEach((plugin) => {
    //       const params = {
    //         namespace: 'default',
    //         artifactName: plugin.artifact.name,
    //         artifactVersion: plugin.artifact.version,
    //         scope: plugin.artifact.scope,
    //         keys: `widgets.${plugin.name}-${plugin.type}`,
    //       };
    //       MyPipelineApi.fetchWidgetJson(params).subscribe((res) => {
    //         const widgetJson = JSON.parse(res[`widgets.${plugin.name}-${plugin.type}`]);
    //         const batchsource = [...this.state.batchsource, { ...plugin, widgetJson }];
    //         this.setState({ batchsource });
    //       });
    //     });
    // });

    this.fetchPlugins('batchsource');
    this.fetchPlugins('batchsink');
    // MyPipelineApi.fetchPlugins({
    //   namespace: 'default',
    //   pipelineType: 'cdap-data-pipeline',
    //   version: '6.2.0-SNAPSHOT',
    //   extensionType: 'batchsink',
    // }).subscribe((res) => {
    //   res
    //     .filter((plugin) => SINK_LIST.includes(plugin.name))
    //     .forEach((plugin) => {
    //       const params = {
    //         namespace: 'default',
    //         artifactName: plugin.artifact.name,
    //         artifactVersion: plugin.artifact.version,
    //         scope: plugin.artifact.scope,
    //         keys: `widgets.${plugin.name}-${plugin.type}`,
    //       };
    //       MyPipelineApi.fetchWidgetJson(params).subscribe((res) => {
    //         const widgetJson = JSON.parse(res[`widgets.${plugin.name}-${plugin.type}`]);
    //         const batchsink = [...this.state.batchsink, { ...plugin, widgetJson }];
    //         this.setState({ batchsink });
    //       });
    //     });
    // });
  }

  public fetchPlugins = (extensionType, version = '6.2.0-SNAPSHOT', namespace = 'default') => {
    MyPipelineApi.fetchPlugins({
      namespace,
      pipelineType: 'cdap-data-pipeline',
      version,
      extensionType,
    }).subscribe((res) => {
      res
        .filter((plugin) => AVAILABLE_PLUGINS[extensionType].includes(plugin.name))
        .forEach((plugin) => {
          const params = {
            namespace,
            artifactName: plugin.artifact.name,
            artifactVersion: plugin.artifact.version,
            scope: plugin.artifact.scope,
            keys: `widgets.${plugin.name}-${plugin.type}`,
          };
          MyPipelineApi.fetchWidgetJson(params).subscribe((widgetJ) => {
            const widgetJson = JSON.parse(widgetJ[`widgets.${plugin.name}-${plugin.type}`]);
            const pl = [...this.state[extensionType], { ...plugin, widgetJson }];
            this.setState({ [extensionType]: pl });
          });
        });
    });
  };

  public onPluginSelect = (plugin) => {
    // const params = {
    //   namespace: 'default',
    //   artifactName: plugin.artifact.name,
    //   artifactVersion: plugin.artifact.version,
    //   scope: plugin.artifact.scope,
    //   keys: `widgets.${plugin.name}-${plugin.type}`,
    // };
    // MyPipelineApi.fetchWidgetJson(params).subscribe((res) => {
    //   const widgetJson = JSON.parse(res[`widgets.${plugin.name}-${plugin.type}`]);
    //   if (plugin.type === 'batchsource') {
    //     this.setState({ selectedSource: { ...plugin, widgetJson, label: 'bigq-source' } });
    //   } else if (plugin.type === 'batchsink') {
    //     this.setState({ selectedSink: { ...plugin, widgetJson, label: 'bigq-sink' } });
    //   }

    //   console.log('widget JSON ', res);
    // });
    let type;
    if (plugin.type === 'batchsource') {
      type = 'selectedSource';
    } else if (plugin.type === 'batchsink') {
      type = 'selectedSink';
    } else {
      return;
    }
    this.setState({ [type]: plugin }, () => {
      this.getPluginProps(plugin);
    });
  };

  public getPluginProps = (plugin) => {
    const pluginParams = {
      namespace: 'default',
      parentArtifact: 'cdap-data-pipeline',
      version: '6.2.0-SNAPSHOT',
      extension: plugin.type,
      pluginName: plugin.name,
      scope: 'SYSTEM',
      artifactName: plugin.artifact.name,
      artifactScope: plugin.artifact.scope,
      limit: 1,
      order: 'DESC',
    };
    MyPipelineApi.getPluginProperties(pluginParams).subscribe((res) => {
      console.log('props', res);
      if (plugin.type === 'batchsource') {
        this.setState({ sourceBP: res[0] });
      } else if (plugin.type === 'batchsink') {
        this.setState({ sinkBP: res[0] });
      }
    });
  };
  public updateVals = (plugin, values) => {};

  public generatePipelineConfig = () => {
    // update connections and stages
    let stages = [];
    let connections = [];
    if (this.state.selectedSource && this.state.selectedSink) {
      stages = [
        {
          name: this.state.selectedSource.label || this.state.selectedSource.plugin.name,
          plugin: {
            name: this.state.selectedSource.name,
            type: this.state.selectedSource.type,
            label: this.state.selectedSource.label,
            artifact: this.state.selectedSource.artifact,
            properties: this.state.selectedSource.properties,
          },
        },
        {
          name: this.state.selectedSink.label || this.state.selectedSink.plugin.name,
          plugin: {
            name: this.state.selectedSink.name,
            type: this.state.selectedSink.type,
            label: this.state.selectedSink.label,
            artifact: this.state.selectedSink.artifact,
            properties: this.state.selectedSink.properties,
          },
        },
      ];
      connections = [
        {
          to: this.state.selectedSink.label || this.state.selectedSink.plugin.name,
          from: this.state.selectedSource.label || this.state.selectedSource.plugin.name,
        },
      ];
    }

    const configuration = {
      artifact: { name: 'cdap-data-pipeline', version: '6.2.0-SNAPSHOT', scope: 'SYSTEM' },
      description: 'Pipeline from Ingestion feature',
      name: this.state.pipelineName,
      config: {
        resources: {
          memoryMB: 2048,
          virtualCores: 1,
        },
        driverResources: {
          memoryMB: 2048,
          virtualCores: 1,
        },
        connections,
        comments: [],
        postActions: [],
        properties: {},
        processTimingEnabled: true,
        stageLoggingEnabled: true,
        stages,
        schedule: '0 * * * *',
        engine: 'spark',
        numOfRecordsPreview: 100,
        maxConcurrentRuns: 1,
      },
    };
    return configuration;
  };
  public publishPipeline = () => {
    this.setState({ publishingPipeline: true });
    console.log('publishing pipelinee');
    const configuration = this.generatePipelineConfig();
    console.log('pipeline configuration is ', JSON.stringify(configuration, null, '\t'));
    // {namespace,pipelineName}
    MyPipelineApi.publish(
      {
        namespace: 'default',
        appId: configuration.name,
      },
      configuration
    )
      .toPromise()
      .then((data) => {
        console.log(' Published pipeline ');
        this.setState({ publishingPipeline: false });
      })
      .catch((err) => {
        this.setState({ publishingPipeline: false });
        console.log('Error publishing pipeline', err);
      });
  };

  public render() {
    const { classes } = this.props;
    const sourceCGProps = {
      pluginProperties: this.state.sourceBP && this.state.sourceBP.properties,
      widgetJson: this.state.selectedSource && this.state.selectedSource.widgetJson,
      values: this.state.selectedSource && this.state.selectedSource.properties,
      onChange: (property) => {
        console.log('on change source ', property);

        const stateCopy = { ...this.state.selectedSource };
        stateCopy.properties = { ...stateCopy.properties, ...property };
        console.log('new state', stateCopy);
        this.setState({ selectedSource: stateCopy });
      },
      onLabelChange: (label) => {
        const stateCopy = { ...this.state.selectedSource };
        stateCopy.label = label;
        this.setState({ selectedSource: stateCopy });
      },
    };
    const sinkCGProps = {
      pluginProperties: this.state.sinkBP && this.state.sinkBP.properties,
      widgetJson: this.state.selectedSink && this.state.selectedSink.widgetJson,
      values: this.state.selectedSink && this.state.selectedSink.properties,
      onChange: (property) => {
        console.log('property is ', property);
        const stateCopy = { ...this.state.selectedSink };
        stateCopy.properties = { ...stateCopy.properties, ...property };
        console.log('new state', stateCopy);
        this.setState({ selectedSink: stateCopy });
      },
      onLabelChange: (label) => {
        const stateCopy = { ...this.state.selectedSink };
        stateCopy.label = label;
        this.setState({ selectedSink: stateCopy });
      },
    };
    const popoverContent = (
      <SinkList title="Sinks" plugins={this.state.batchsink} onPluginSelect={this.onPluginSelect} />
    );
    return (
      <div className={classes.root}>
        <Helmet title={'Ingestion'} />
        <h3> Select a source and target for the transfer. </h3>
        <PluginList
          title="Sources"
          plugins={this.state.batchsource}
          onPluginSelect={this.onPluginSelect}
          popoverContent={popoverContent}
        />

        <div className={classes.jobInfo}>
          <TextField
            variant="outlined"
            label="Transfer Name"
            margin="dense"
            value={this.state.pipelineName}
            onChange={(event) => this.setState({ pipelineName: event.target.value })}
          />
          <Button
            disabled={this.state.publishingPipeline}
            color="primary"
            onClick={this.publishPipeline}
          >
            Publish
          </Button>
        </div>
        <div className={classes.propsContainer}>
          <If condition={this.state.sourceBP && this.state.selectedSource}>
            <div className={classes.propsRenderBlock}>
              <WidgetRenderer
                title="Source"
                plugin={this.state.selectedSource}
                cgProps={sourceCGProps}
              />
            </div>
          </If>
          <If condition={this.state.sinkBP && this.state.selectedSink}>
            <div className={classes.propsRenderBlock}>
              <WidgetRenderer title="Sink" plugin={this.state.selectedSink} cgProps={sinkCGProps} />
            </div>
          </If>
        </div>
      </div>
    );
  }
}

const Ingestion = withStyles(styles)(IngestionView);
export default Ingestion;
