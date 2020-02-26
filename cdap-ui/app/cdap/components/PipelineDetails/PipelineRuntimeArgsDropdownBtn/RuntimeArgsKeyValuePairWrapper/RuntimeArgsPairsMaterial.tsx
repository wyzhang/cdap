/*
 * Copyright © 2020 Cask Data, Inc.
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
import AbstractMultiRowWidget, {
  IMultiRowProps,
} from 'components/AbstractWidget/AbstractMultiRowWidget';
import RuntimeArgsRow from 'components/PipelineDetails/PipelineRuntimeArgsDropdownBtn/RuntimeArgsKeyValuePairWrapper/RuntimeArgsRow';
import ThemeWrapper from 'components/ThemeWrapper';
import { objectQuery } from 'services/helpers';

interface IRuntimeArgsPairsWidgetProps {
  'key-placeholder'?: string;
  'value-placeholder'?: string;
  'kv-delimiter'?: string;
  delimiter?: string;
}

interface IRuntimeArgsPairsProps extends IMultiRowProps<IRuntimeArgsPairsWidgetProps> {
  isEncoded?: boolean; // for compatiblity with keyvalue-encoded type
}

class RuntimeArgsPairsView extends AbstractMultiRowWidget<IRuntimeArgsPairsProps> {
  public componentWillReceiveProps(nextProps) {
    const currentValue = this.constructValues();
    if (currentValue.length === nextProps.value.length) {
      return;
    }
    this.init(nextProps);
  }
  public constructValues = () => {
    const values = this.state.rows
      .filter((id) => this.values[id] && this.values[id].value)
      .map((id) => this.values[id].value);
    return values;
  };
  public deconstructValues = (props) => {
    if (!props.value || props.value.length === 0) {
      return [];
    }
    const kvDelimiter = objectQuery(props, 'widgetProps', 'kv-delimiter') || ':::';
    return props.value.map((arg) => ({
      key: arg.key,
      value: arg.value,
      notDeletable: arg.notDeletable,
    }));
  };
  public renderRow = (id, index) => {
    const keyPlaceholder = objectQuery(this.props, 'widgetProps', 'key-placeholder');
    const valuePlaceholder = objectQuery(this.props, 'widgetProps', 'value-placeholder');
    const isEncoded = this.props.isEncoded || objectQuery(this.props, 'widgetProps', 'isEncoded');
    const value = this.values[id].value;

    return (
      <RuntimeArgsRow
        key={id}
        value={value}
        id={id}
        index={index}
        onChange={this.editRow}
        addRow={this.addRow.bind(this, index)}
        removeRow={this.removeRow.bind(this, index)}
        autofocus={this.state.autofocus === id}
        changeFocus={this.changeFocus}
        disabled={this.props.disabled}
        keyPlaceholder={keyPlaceholder}
        valuePlaceholder={valuePlaceholder}
        isEncoded={isEncoded}
        forwardedRef={this.values[id].ref}
        errors={this.props.errors}
      />
    );
  };
}
export default function RuntimeArgsPairs(props) {
  return (
    <ThemeWrapper>
      <RuntimeArgsPairsView {...props} />
    </ThemeWrapper>
  );
}
