import { __, Alert } from 'modules/common/utils';
import { jsPlumb } from 'jsplumb';
import jquery from 'jquery';
import RTG from 'react-transition-group';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { IAction, IAutomation, ITrigger } from '../../types';
import {
  Container,
  CenterFlexRow,
  BackButton,
  Title,
  RightDrawerContainer,
  AutomationFormContainer
} from '../../styles';
import { FormControl } from 'modules/common/components/form';
import { BarItems, HeightedWrapper } from 'modules/layout/styles';
import Button from 'modules/common/components/Button';
import TriggerForm from '../../containers/forms/TriggerForm';
import ActionsForm from '../../containers/forms/ActionsForm';
import TriggerDetailForm from './TriggerDetailForm';
import {
  createInitialConnections,
  connection,
  deleteConnection,
  deleteControl,
  sourceEndpoint,
  targetEndpoint
} from 'modules/automations/utils';
import ActionDetailForm from './ActionDetailForm';
import Icon from 'modules/common/components/Icon';
import PageContent from 'modules/layout/components/PageContent';
import { Tabs, TabTitle } from 'modules/common/components/tabs';

const plumb: any = jsPlumb;
let instance;

type Props = {
  id?: string;
  mainType: string;
  automation?: IAutomation;
  save: (params: any) => void;
};

type State = {
  name: string;
  status: string;
  currentTab: string;
  showTrigger: boolean;
  showDrawer: boolean;
  showAction: boolean;
  actions: IAction[];
  triggers: ITrigger[];
  activeTrigger: ITrigger;
  activeAction: IAction;
  selectedContentId?: string;
};

class AutomationForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const {
      automation = {
        name: 'Your automation title',
        status: 'draft',
        triggers: [],
        actions: []
      }
    } = this.props;

    this.state = {
      name: automation.name,
      status: automation.status,
      actions: automation.actions || [],
      triggers: automation.triggers || [],
      activeTrigger: {} as ITrigger,
      currentTab: 'triggers',
      showTrigger: false,
      showDrawer: false,
      showAction: false,
      activeAction: {} as IAction
    };
  }

  componentDidMount() {
    instance = plumb.getInstance({
      DragOptions: { cursor: 'pointer', zIndex: 2000 },
      // PaintStyle: {
      //   gradient: {
      //     stops: [
      //       [0, '#0d78bc'],
      //       [1, '#558822']
      //     ]
      //   },
      //   stroke: '#558822',
      //   strokeWidth: 3
      // },
      ConnectionOverlays: [
        [
          'Arrow',
          {
            location: 1,
            visible: true,
            width: 20,
            length: 20,
            id: 'ARROW'
          }
        ]
      ],
      Container: 'canvas'
    });

    instance.bind('ready', () => {
      const { triggers, actions } = this.state;

      instance.bind('connection', info => {
        this.onConnection(info);
      });

      instance.bind('connectionDetached', info => {
        this.onDettachConnection(info);
      });

      for (const action of actions) {
        this.renderAction(action);
      }

      for (const trigger of triggers) {
        this.renderTrigger(trigger);
      }

      // create connections ===================
      createInitialConnections(triggers, actions, instance);

      // delete connections ===================
      deleteConnection(instance);

      // delete control ===================
      deleteControl();

      // delete from state ===================
      jquery('#canvas').on('click', '.delete-control', () => {
        const item = (window as any).selectedControl;
        const splitItem = item.split('-');
        const type = splitItem[0];

        instance.remove(item);

        if (type === 'action') {
          return this.setState({
            actions: actions.filter(action => action.id !== splitItem[1])
          });
        }

        if (type === 'trigger') {
          return this.setState({
            triggers: triggers.filter(trigger => trigger.id !== splitItem[1])
          });
        }
      });
    });
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { name, status, triggers, actions } = this.state;
    const { id, save } = this.props;

    if (!name) {
      return Alert.error('Enter an Automation name');
    }

    const generateValues = () => {
      const finalValues = {
        _id: id,
        name,
        status,
        triggers: triggers.map(t => ({
          id: t.id,
          type: t.type,
          actionId: t.actionId,
          config: t.config,
          style: jquery(`#trigger-${t.id}`).attr('style')
        })),
        actions: actions.map(a => ({
          id: a.id,
          type: a.type,
          nextActionId: a.nextActionId,
          config: a.config,
          style: jquery(`#action-${a.id}`).attr('style')
        }))
      };

      return finalValues;
    };

    save(generateValues());
  };

  onAddActionConfig = config => {
    const { activeAction } = this.state;

    activeAction.config = config;
    this.setState({ activeAction });
  };

  onClickTrigger = (trigger: ITrigger) => {
    const config = trigger && trigger.config;
    const selectedContentId = config && config.contentId;

    this.setState({
      showTrigger: true,
      showDrawer: true,
      showAction: false,
      currentTab: 'triggers',
      selectedContentId,
      activeTrigger: trigger ? trigger : ({} as ITrigger)
    });
  };

  onClickAction = (action: IAction) => {
    this.setState({
      showAction: true,
      showDrawer: true,
      showTrigger: false,
      currentTab: 'actions',
      activeAction: action ? action : ({} as IAction)
    });
  };

  onConnection = info => {
    const { triggers, actions } = this.state;

    connection(triggers, actions, info, info.targetId.replace('action-', ''));

    this.setState({ triggers, actions });
  };

  onDettachConnection = info => {
    const { triggers, actions } = this.state;

    connection(triggers, actions, info, undefined);

    this.setState({ triggers, actions });
  };

  tabOnClick = (currentTab: string) => {
    this.setState({ currentTab });
  };

  toggleDrawer = () => {
    this.setState({ showDrawer: !this.state.showDrawer });
  };

  addTrigger = (value: string, contentId?: string, triggerId?: string) => {
    const { triggers, activeTrigger } = this.state;

    let trigger: any = { id: String(triggers.length), type: value };
    const triggerIndex = triggers.findIndex(t => t.id === triggerId);

    if (triggerId && activeTrigger.id === triggerId) {
      trigger = activeTrigger;
    }

    if (contentId) {
      trigger.config = {
        contentId
      };
    }

    if (triggerIndex !== -1) {
      triggers[triggerIndex] = trigger;
    } else {
      triggers.push(trigger);
    }

    this.setState({ triggers, activeTrigger: trigger });

    if (!triggerId) {
      this.renderTrigger(trigger);
    }
  };

  addAction = (
    value: string,
    contentId?: string,
    actionId?: string,
    config?: any
  ) => {
    const { actions } = this.state;

    let action: any = { id: String(actions.length), type: value };

    let actionIndex = -1;

    if (actionId) {
      actionIndex = actions.findIndex(a => a.id === actionId);

      if (actionIndex !== -1) {
        action = actions[actionIndex];
      }
    }

    if (contentId) {
      action.config = {
        contentId
      };
    }

    if (config) {
      action.config = config;
    }

    if (actionIndex !== -1) {
      actions[actionIndex] = action;
    } else {
      actions.push(action);
    }

    this.setState({ actions, activeAction: action });

    if (!actionId) {
      this.renderAction(action);
    }
  };

  onNameChange = (e: React.FormEvent<HTMLElement>) => {
    const value = (e.currentTarget as HTMLButtonElement).value;
    this.setState({ name: value });
  };

  renderTrigger = (trigger: ITrigger) => {
    const idElm = `trigger-${trigger.id}`;

    jquery('#canvas').append(`
      <div class="trigger control" id="${idElm}" style="${trigger.style}">
        ${trigger.type}
      </div>
    `);

    jquery('#canvas').on('dblclick', `#${idElm}`, event => {
      event.preventDefault();

      this.onClickTrigger(trigger);
    });

    instance.addEndpoint(idElm, sourceEndpoint, {
      anchor: [1, 0.5]
    });

    instance.draggable(instance.getSelector(`#${idElm}`));
  };

  renderAction = (action: IAction) => {
    const idElm = `action-${action.id}`;

    jquery('#canvas').append(`
          <div class="action control" id="${idElm}" style="${action.style}" type="${action.type}">
            ${action.type}
          </div>
        `);

    jquery('#canvas').on('dblclick', `#${idElm}`, event => {
      event.preventDefault();

      this.onClickAction(action);
    });

    if (action.type === 'if') {
      instance.addEndpoint(idElm, targetEndpoint, {
        anchor: ['Left']
      });

      instance.addEndpoint(idElm, sourceEndpoint, {
        anchor: [1, 0.2],
        overlays: [
          [
            'Label',
            {
              location: [1.8, 0.5],
              label: 'Yes',
              visible: true
            }
          ]
        ]
      });

      instance.addEndpoint(idElm, sourceEndpoint, {
        anchor: [1, 0.8],
        overlays: [
          [
            'Label',
            {
              location: [1.8, 0.5],
              label: 'No',
              visible: true
            }
          ]
        ]
      });
    } else {
      instance.addEndpoint(idElm, targetEndpoint, {
        anchor: ['Left']
      });

      instance.addEndpoint(idElm, sourceEndpoint, {
        anchor: ['Right']
      });
    }

    instance.draggable(instance.getSelector(`#${idElm}`));
  };

  rendeRightActionBar() {
    return (
      <BarItems>
        <Button
          btnStyle="primary"
          size="small"
          icon="plus-circle"
          onClick={this.toggleDrawer}
        >
          Add Trigger or Action
        </Button>
        <Button
          btnStyle="success"
          size="small"
          icon={'check-circle'}
          onClick={this.handleSubmit}
        >
          Publish to site
        </Button>
      </BarItems>
    );
  }

  renderLeftActionBar() {
    return (
      <CenterFlexRow>
        <BackButton>
          <Icon icon="angle-left" size={20} />
        </BackButton>
        <Title>
          <FormControl
            name="name"
            value={this.state.name}
            onChange={this.onNameChange}
            required={true}
            autoFocus={true}
          />
          <Icon icon="edit-alt" size={16} />
        </Title>
      </CenterFlexRow>
    );
  }

  renderTabContent() {
    const {
      currentTab,
      showTrigger,
      showAction,
      activeTrigger,
      activeAction,
      selectedContentId
    } = this.state;

    const onBack = () => this.setState({ showTrigger: false });
    const onBackAction = () => this.setState({ showAction: false });

    if (currentTab === 'triggers') {
      if (showTrigger && activeTrigger) {
        return (
          <>
            <div onClick={onBack} style={{ cursor: 'pointer' }}>
              <Icon icon="leftarrow-2" /> Back to triggers
            </div>
            <TriggerDetailForm
              activeTrigger={activeTrigger}
              addConfig={this.addTrigger}
              closeModal={onBack}
              contentId={selectedContentId}
            />
          </>
        );
      }

      return (
        <TriggerForm
          addConfig={this.addTrigger}
          onClickTrigger={this.onClickTrigger}
          mainType={this.props.mainType}
        />
      );
    }

    if (currentTab === 'actions') {
      if (showAction && activeAction) {
        return (
          <>
            <div onClick={onBackAction} style={{ cursor: 'pointer' }}>
              <Icon icon="leftarrow-2" /> Back to actions
            </div>
            <ActionDetailForm
              activeAction={activeAction}
              addAction={this.addAction}
              addActionConfig={this.onAddActionConfig}
            />
          </>
        );
      }

      return (
        <ActionsForm
          addAction={this.addAction}
          onClickAction={this.onClickAction}
          addActionConfig={this.onAddActionConfig}
        />
      );
    }

    return <div>Favourite itemss</div>;
  }

  render() {
    const { automation } = this.props;
    const { currentTab } = this.state;

    return (
      <>
        <HeightedWrapper>
          <AutomationFormContainer>
            <Wrapper.Header
              title={`${'Automations' || ''}`}
              breadcrumb={[
                { title: __('Automations'), link: '/automations' },
                { title: `${(automation && automation.name) || ''}` }
              ]}
            />
            <PageContent
              actionBar={
                <Wrapper.ActionBar
                  left={this.renderLeftActionBar()}
                  right={this.rendeRightActionBar()}
                />
              }
              transparent={false}
            >
              <Container>
                <div id="canvas" />
              </Container>
            </PageContent>
          </AutomationFormContainer>

          <RTG.CSSTransition
            in={this.state.showDrawer}
            timeout={300}
            classNames="slide-in-right"
            unmountOnExit={true}
          >
            <RightDrawerContainer>
              <Tabs full={true}>
                <TabTitle
                  className={currentTab === 'favourite' ? 'active' : ''}
                  onClick={this.tabOnClick.bind(this, 'favourite')}
                >
                  {__('Favorite')}
                </TabTitle>
                <TabTitle
                  className={currentTab === 'triggers' ? 'active' : ''}
                  onClick={this.tabOnClick.bind(this, 'triggers')}
                >
                  {__('Triggers')}
                </TabTitle>
                <TabTitle
                  className={currentTab === 'actions' ? 'active' : ''}
                  onClick={this.tabOnClick.bind(this, 'actions')}
                >
                  {__('Actions')}
                </TabTitle>
              </Tabs>
              {this.renderTabContent()}
            </RightDrawerContainer>
          </RTG.CSSTransition>
        </HeightedWrapper>
      </>
    );
  }
}

export default AutomationForm;