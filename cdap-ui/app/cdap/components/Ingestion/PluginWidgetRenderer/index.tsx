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
import { MyPipelineApi } from 'api/pipeline';
import ConfigurationGroup from 'components/ConfigurationGroup';
import If from 'components/If';
import { Card, TextField } from '@material-ui/core';

const styles = (): StyleRules => {
  return {
    root: {
      height: 'auto',
      padding: 20,
    },
    labelContainer: {
      padding: 10,
      width: '100%',
    },
    heading: {
      textAlign: 'center',
    },
  };
};

interface IPluginWidgetRendererProps extends WithStyles<typeof styles> {
  plugin: any;
  cgProps: any;
  title: string;
}

class PluginWidgetRendererView extends React.Component<IPluginWidgetRendererProps> {
  public render() {
    const { classes, cgProps, title } = this.props;
    return (
      <Card className={classes.root}>
        <p className={classes.heading}>{`${title} - ${
          cgProps.widgetJson ? cgProps.widgetJson['display-name'] : ''
        }`}</p>
        <div className={classes.labelContainer}>
          <TextField
            label="Label"
            variant="outlined"
            margin="dense"
            fullWidth={true}
            value={cgProps.label}
            onChange={(event) => cgProps.onLabelChange(event.target.value)}
          />
        </div>
        <If condition={cgProps.pluginProperties && cgProps.widgetJson}>
          <ConfigurationGroup
            pluginProperties={cgProps.pluginProperties && cgProps.pluginProperties}
            widgetJson={cgProps.widgetJson && cgProps.widgetJson}
            values={cgProps.values}
            onChange={cgProps.onChange}
            validateProperties={(cb) => {
              console.log('validating props');
              cb();
            }}
          />
        </If>
      </Card>
    );
  }
}

const PluginWidgetRenderer = withStyles(styles)(PluginWidgetRendererView);
export default PluginWidgetRenderer;
