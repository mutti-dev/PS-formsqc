import { updateConditionReferencesInJson, extractLabelsFromJSON } from './utils';
import { extractFormJson, removeSubmitButtonsOutsideContainer } from './jsonUtils';

describe('extractFormJson', () => {
  it('returns the same object instance when the input is already parsed', () => {
    const parsed = {
      config: {
        components: [{ key: 'name', type: 'textfield', label: 'Name' }],
      },
    };

    const result = extractFormJson(parsed);

    expect(result).toBe(parsed.config);
  });
});

describe('updateConditionReferencesInJson', () => {
  it('updates conditional.when when a field key changes', () => {
    const json = {
      components: [
        {
          key: 'fieldA',
          label: 'Field A',
          conditional: { when: 'fieldB', eq: 'show' },
        },
      ],
    };

    const result = updateConditionReferencesInJson(json, 'fieldB', 'fieldC', ['when']);

    expect(result.updated.components[0].conditional.when).toBe('fieldC');
    expect(result.patches).toEqual([
      expect.objectContaining({
        fieldKey: 'fieldA',
        oldWhen: 'fieldB',
        newWhen: 'fieldC',
      }),
    ]);
  });

  it('updates dotted conditional.when references when a field key changes', () => {
    const json = {
      components: [
        {
          key: 'Benefits_Categories',
          label: 'Benefits Categories',
          conditional: { when: 'Container.Benefits_Detail.Benefits_Categories', eq: 'show' },
        },
      ],
    };

    const result = updateConditionReferencesInJson(json, 'Benefits_Categories', 'BenefitsCategory', ['when']);

    expect(result.updated.components[0].conditional.when).toBe('Container.Benefits_Detail.BenefitsCategory');
    expect(result.patches).toEqual([
      expect.objectContaining({
        fieldKey: 'Benefits_Categories',
        oldWhen: 'Benefits_Categories',
        newWhen: 'BenefitsCategory',
      }),
    ]);
  });

  it('updates conditional.eq only for the matching parent field', () => {
    const json = {
      components: [
        {
          key: 'Select_Department123',
          label: 'Select Department 123',
          type: 'select',
          data: { values: [{ label: 'Other', value: 'Other123' }] },
        },
        {
          key: 'Other_Departmen1',
          label: 'Other Departmen',
          conditional: { when: 'Container.Select_Department123', eq: 'Other123' },
        },
        {
          key: 'Other_Departmen2',
          label: 'Other Departmen 2',
          conditional: { when: 'Container.Select_Department', eq: 'Other123' },
        },
      ],
    };

    const result = updateConditionReferencesInJson(json, 'Other123', 'other123', ['eq'], [], { referenceKey: 'Select_Department123' });

    expect(result.updated.components[1].conditional.eq).toBe('other123');
    expect(result.updated.components[2].conditional.eq).toBe('Other123');
  });

  it('updates conditional.eq when a select or radio option value changes', () => {
    const json = {
      components: [
        {
          key: 'status',
          label: 'Status',
          conditional: { when: 'status', eq: 'active' },
        },
      ],
    };

    const result = updateConditionReferencesInJson(json, 'active', 'inactive', ['eq']);

    expect(result.updated.components[0].conditional.eq).toBe('inactive');
    expect(result.patches).toEqual([
      expect.objectContaining({
        fieldKey: 'status',
        oldEq: 'active',
        newEq: 'inactive',
      }),
    ]);
  });
});

describe('Multiselect vs Single Select support', () => {
  it('extractLabelsFromJSON includes multiple property for select components', () => {
    const json = {
      components: [
        { label: 'Multi Dropdown', key: 'multiDrop', type: 'select', multiple: true },
        { label: 'Single Dropdown', key: 'singleDrop', type: 'select', multiple: false },
        { label: 'Default Dropdown', key: 'defaultDrop', type: 'select' },
      ],
    };

    const labels = extractLabelsFromJSON(json);
    expect(labels).toHaveLength(3);
    expect(labels[0].multiple).toBe(true);
    expect(labels[1].multiple).toBe(false);
    expect(labels[2].multiple).toBeUndefined();
  });
});

describe('removeSubmitButtonsOutsideContainer', () => {
  it('removes submit buttons located outside of a container', () => {
    const components = [
      { label: 'Container', key: 'Container', type: 'container', components: [] },
      { label: 'Submit', key: 'submit', type: 'button', action: 'submit' },
    ];

    const cleaned = removeSubmitButtonsOutsideContainer(components);
    expect(cleaned).toHaveLength(1);
    expect(cleaned[0].type).toBe('container');
  });
});

