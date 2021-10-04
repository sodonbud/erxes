import Icon from 'modules/common/components/Icon';
import { FieldsCombinedByType } from 'modules/settings/properties/types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { Attributes } from '../styles';

type Props = {
  config: any;
  triggerType: string;
  setConfig: (config: any) => void;
  inputName?: string;
  attributions: FieldsCombinedByType[];
  fieldType?: string;
  attrType?: string;
  onlySet?: boolean;
};

export default class Attribution extends React.Component<Props> {
  private overlay: any;

  hideContent = () => {
    this.overlay.hide();
  };

  getComma = preValue => {
    if (this.props.fieldType === 'select' && preValue) {
      return ', ';
    }

    if (preValue) {
      return ' ';
    }

    return '';
  };

  onClickAttribute = item => {
    this.overlay.hide();

    const { config, setConfig, inputName = 'value' } = this.props;

    if (this.props.onlySet) {
      config[inputName] = `{{ ${item.name} }}`;
    } else {
      config[inputName] = `${config[inputName] || ''}${this.getComma(
        config[inputName]
      )}{{ ${item.name} }}`;
    }

    setConfig(config);
  };

  renderContent() {
    const { attributions, attrType } = this.props;
    let filterAttrs = attributions;

    if (attrType) {
      filterAttrs = filterAttrs.filter(f => f.type === attrType);
    }

    return (
      <Popover id="attribute-popover">
        <Attributes>
          <React.Fragment>
            <li>
              <b>Attributions</b>
            </li>
            {filterAttrs.map(item => (
              <li
                key={item.name}
                onClick={this.onClickAttribute.bind(this, item)}
              >
                {item.label}
              </li>
            ))}
          </React.Fragment>
        </Attributes>
      </Popover>
    );
  }

  render() {
    return (
      <OverlayTrigger
        ref={overlay => {
          this.overlay = overlay;
        }}
        trigger="click"
        placement="top"
        overlay={this.renderContent()}
        rootClose={true}
        container={this}
      >
        <span>
          Attribution <Icon icon="angle-down" />
        </span>
      </OverlayTrigger>
    );
  }
}