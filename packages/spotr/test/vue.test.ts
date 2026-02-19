/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest';
import { ref, defineComponent, nextTick, computed } from 'vue';
import { mount } from '@vue/test-utils';
import { useSpotr } from '../src/vue';
import { defaultOptions, type Person } from './fixtures';
import type { SpotrOptions } from '../src/types';

const TestComponent = defineComponent({
  setup() {
    const options = ref<SpotrOptions<Person>>({ ...defaultOptions });
    const spotr = useSpotr(options);
    return { spotr };
  },
  template: '<div></div>',
});

describe('useSpotr (Vue)', () => {
  it('returns a ref to a Spotr instance', async () => {
    const wrapper = mount(TestComponent);
    await nextTick();
    const spotrValue = wrapper.vm.spotr;
    expect(spotrValue).toBeDefined();
    expect(spotrValue).not.toBeNull();
    if (spotrValue) {
      expect(spotrValue).toHaveProperty('query');
      expect(typeof spotrValue.query).toBe('function');
    }
  });

  it('returns empty results for empty query', async () => {
    const wrapper = mount(TestComponent);
    await nextTick();
    const spotr = wrapper.vm.spotr;
    const result = spotr!.query('');
    expect(result.results).toHaveLength(0);
  });

  it('finds fuzzy matches', async () => {
    const wrapper = mount(TestComponent);
    await nextTick();
    const spotr = wrapper.vm.spotr;
    const result = spotr!.query('alice');
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].item.firstName).toBe('Alice');
  });

  it('accepts getter function as options (MaybeRefOrGetter)', async () => {
    const optionsGetter = (): SpotrOptions<Person> => ({ ...defaultOptions });
    const GetterComponent = defineComponent({
      setup() {
        const spotr = useSpotr(optionsGetter);
        return { spotr };
      },
      template: '<div></div>',
    });
    const wrapper = mount(GetterComponent);
    await nextTick();
    const spotr = wrapper.vm.spotr;
    expect(spotr).toBeDefined();
    expect(spotr).not.toBeNull();
    const result = spotr!.query('alice');
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].item.firstName).toBe('Alice');
  });

  it('accepts computed ref as options', async () => {
    const baseOptions = ref<SpotrOptions<Person>>({ ...defaultOptions });
    const computedComponent = defineComponent({
      setup() {
        const computedOptions = computed(() => baseOptions.value);
        const spotr = useSpotr(computedOptions);
        return { spotr };
      },
      template: '<div></div>',
    });
    const wrapper = mount(computedComponent);
    await nextTick();
    const spotr = wrapper.vm.spotr;
    expect(spotr).toBeDefined();
    const result = spotr!.query('alice');
    expect(result.results.length).toBeGreaterThan(0);
  });

  it('recreates Spotr when reactive options change', async () => {
    const options = ref<SpotrOptions<Person>>({ ...defaultOptions });
    const ReactiveComponent = defineComponent({
      setup() {
        const spotr = useSpotr(options);
        return { spotr };
      },
      template: '<div></div>',
    });
    const wrapper = mount(ReactiveComponent);
    await nextTick();
    const spotr1 = wrapper.vm.spotr;

    const differentPeople: Person[] = [
      { firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com' },
    ];
    options.value = {
      collection: differentPeople,
      fields: ['firstName', 'lastName'],
    };
    await nextTick();

    const spotr2 = wrapper.vm.spotr;
    expect(spotr2).not.toBe(spotr1);
    expect(spotr2!.collection).toHaveLength(1);
    expect(spotr2!.collection[0].firstName).toBe('Charlie');
    const result = spotr2!.query('charlie');
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].item.firstName).toBe('Charlie');
  });
});
