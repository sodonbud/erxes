import React, { useState } from 'react';
import Select from 'react-select-plus';
import { ControlLabel, FormControl } from 'erxes-ui/lib/components/form';
import { __ } from 'erxes-ui/lib/utils';
import {
  FeatureRow,
  FeatureRowItem,
  FeatureLayout,
  GeneralWrapper,
  TeamPortal,
  FeatureRowFlex,
  DeleteButton
} from '../styles';
import Button from 'erxes-ui/lib/components/Button';
import Icon from 'erxes-ui/lib/components/Icon';
import { ICON_OPTIONS, TYPE_OPTIONS } from '../constants';
import { IExm } from '../types';
import { generateTree, removeTypename } from '../utils';

const getEmptyFeature = () => ({
  _id: Math.random().toString(),
  icon: 'reply',
  contentType: 'form',
  name: '',
  description: '',
  contentId: '',
  subContentId: ''
});

type Props = {
  exm: IExm;
  edit: (variables: IExm) => void;
  brands: any[];
  kbTopics: any[];
  kbCategories: { [key: string]: any[] };
  getKbCategories: (topicId: string) => void;
};

export default function General(props: Props) {
  const { brands, kbTopics, exm, edit, getKbCategories, kbCategories } = props;
  const exmFeatures = exm.features || [];
  const [name, setName] = useState(exm.name || '');
  const [description, setDescription] = useState(exm.description || '');
  const [features, setFeatures] = useState(
    exmFeatures.length > 0 ? removeTypename(exmFeatures) : [getEmptyFeature()]
  );

  const onChangeFeature = (type: string, _id?: string) => {
    if (type === 'add') {
      setFeatures([...features, getEmptyFeature()]);
    } else {
      const modifiedFeatures = features.filter(f => f._id !== _id);

      setFeatures(modifiedFeatures);
    }
  };

  const onChangeFeatureItem = (_id: string, key: string, value: any) => {
    const feature = features.find(f => f._id === _id);

    if (feature) {
      feature[key] = value;

      setFeatures([...features]);
    }
  };

  const getContentValues = (contentType: string) => {
    if (contentType === 'form') {
      return brands.map(f => ({ value: f._id, label: f.name }));
    }

    return kbTopics.map(c => ({ value: c._id, label: c.title }));
  };

  const getCategoryValues = (contentId, categories, parentId) => {
    if (!categories) {
      getKbCategories(contentId);

      return [];
    } else {
      return generateTree(
        categories,
        parentId,
        node => ({
          value: node._id,
          label: `${node.parentCategoryId ? '---' : ''} ${node.title}`
        }),
        'parentCategoryId'
      );
    }
  };

  const onSave = () => {
    edit({ _id: exm._id, name, description, features });
  };

  return (
    <GeneralWrapper>
      <TeamPortal>
        <p>Team portal</p>
        <FeatureRow>
          <FeatureRowItem>
            <ControlLabel>{__('Name your team portal')}</ControlLabel>
            <FormControl
              value={name}
              placeholder='Name'
              onChange={(e: any) => setName(e.target.value)}
            />
          </FeatureRowItem>
          <FeatureRowItem>
            <ControlLabel>{__('Describe your team portal')}</ControlLabel>
            <FormControl
              value={description}
              placeholder='Description'
              onChange={(e: any) => setDescription(e.target.value)}
            />
          </FeatureRowItem>
        </FeatureRow>
      </TeamPortal>
      <FeatureLayout>
        <p>Features</p>
        <FeatureRow>
              <FeatureRowItem>Type</FeatureRowItem>
              <FeatureRowItem>Icon</FeatureRowItem>
              <FeatureRowItem>Name</FeatureRowItem>
              <FeatureRowItem>Description</FeatureRowItem>
              <FeatureRowItem>Which to Display</FeatureRowItem>
        </FeatureRow>
        {features.map(feature => (
          <FeatureRow key={feature._id}>
            <FeatureRowFlex>
            <FeatureRowItem>
              <FormControl
                componentClass='select'
                value={feature.contentType}
                options={TYPE_OPTIONS}
                onChange={(e: any) => {
                  onChangeFeatureItem(
                    feature._id,
                    'contentType',
                    e.target.value
                  );
                } } />
            </FeatureRowItem>
            <FeatureRowItem>
              <FormControl
                componentClass='select'
                value={feature.icon}
                options={ICON_OPTIONS}
                onChange={(e: any) => onChangeFeatureItem(feature._id, 'icon', e.target.value)} />
            </FeatureRowItem>
            <FeatureRowItem>
              <FormControl
                name='name'
                placeholder='Name'
                value={feature.name}
                onChange={(e: any) => onChangeFeatureItem(feature._id, 'name', e.target.value)} />
            </FeatureRowItem>
            <FeatureRowItem>
              <FormControl
                name='description'
                placeholder='Description'
                value={feature.description}
                onChange={(e: any) => onChangeFeatureItem(
                  feature._id,
                  'description',
                  e.target.value
                )} />
            </FeatureRowItem>
            <FeatureRowItem>
              <Select
                placeholder={__(
                  `Choose a ${feature.contentType === 'knowledgeBase'
                    ? 'knowledge base'
                    : 'brand'}`
                )}
                value={feature.contentId}
                options={getContentValues(feature.contentType)}
                onChange={item => {
                  if (feature.contentType === 'knowledgeBase') {
                    getKbCategories(item.value);
                  }

                  onChangeFeatureItem(feature._id, 'contentId', item.value);
                } }
                clearable={false} />
            </FeatureRowItem>

            {feature.contentType === 'knowledgeBase' && (
              <FeatureRowItem>
                <Select
                  placeholder={__('Choose a category')}
                  value={feature.subContentId}
                  options={getCategoryValues(
                    feature.contentId,
                    kbCategories[feature.contentId],
                    null
                  )}
                  style={{ width: 200 }}
                  onChange={item => onChangeFeatureItem(feature._id, 'subContentId', item.value)}
                  clearable={false} />
              </FeatureRowItem>
            )}
            </FeatureRowFlex>
            <DeleteButton onClick={() => onChangeFeature('remove', feature._id)} title={'Delete Feature'}>
            <Icon icon="cancel-1" size={15}/>
            </DeleteButton>
          </FeatureRow>
        ))}
        <Button btnStyle="primary" icon = 'plus-circle'  onClick={() => onChangeFeature('add')} >Add Features</Button>
      </FeatureLayout>
      <Button btnStyle='success' icon="check-circle" onClick={onSave}>
        Save
      </Button>
    </GeneralWrapper>
  );
}