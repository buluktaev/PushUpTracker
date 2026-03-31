'use client'

import Button from '@/components/Button'
import ChoiceCard from '@/components/ChoiceCard'
import IconButton from '@/components/IconButton'
import Input from '@/components/Input'
import Loader from '@/components/Loader'
import RadioButton from '@/components/RadioButton'
import SelectCard from '@/components/SelectCard'
import Tab from '@/components/Tab'
import TextButton from '@/components/TextButton'

function SectionLabel({ label }: { label: string }) {
  return (
    <div
      className="mb-4 text-[var(--size-12)] uppercase"
      style={{
        color: 'var(--text-secondary)',
        letterSpacing: 'var(--letter-spacing-1-5)',
        lineHeight: 'var(--line-height-18)',
      }}
    >
      {'// ' + label}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <SectionLabel label={title} />
      {children}
    </section>
  )
}

export function ComponentSheet() {
  return (
    <div
      className="space-y-10 p-6"
      style={{
        minHeight: 900,
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'var(--font-primary)',
      }}
    >
      <Section title="buttons">
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, minmax(160px, 200px))' }}>
          <Button variant="primary" state="default">primary</Button>
          <Button variant="secondary" state="default">secondary</Button>
          <Button variant="danger" state="default">danger</Button>

          <Button variant="primary" state="hovered">primary</Button>
          <Button variant="secondary" state="hovered">secondary</Button>
          <Button variant="danger" state="hovered">danger</Button>

          <Button variant="primary" state="pressed">primary</Button>
          <Button variant="secondary" state="pressed">secondary</Button>
          <Button variant="danger" state="pressed">danger</Button>

          <Button variant="primary" disabled>primary</Button>
          <Button variant="secondary" disabled>secondary</Button>
          <Button variant="danger" disabled>danger</Button>

          <Button variant="primary" loading>primary</Button>
          <Button variant="secondary" loading>secondary</Button>
          <Button variant="danger" loading>danger</Button>
        </div>
      </Section>

      <Section title="text button">
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, minmax(120px, 160px))' }}>
          <TextButton variant="primary" state="default">primary</TextButton>
          <TextButton variant="secondary" state="default">secondary</TextButton>
          <TextButton variant="danger" state="default">danger</TextButton>

          <TextButton variant="primary" state="hovered">primary</TextButton>
          <TextButton variant="secondary" state="hovered">secondary</TextButton>
          <TextButton variant="danger" state="hovered">danger</TextButton>

          <TextButton variant="primary" state="pressed">primary</TextButton>
          <TextButton variant="secondary" state="pressed">secondary</TextButton>
          <TextButton variant="danger" state="pressed">danger</TextButton>

          <TextButton variant="primary" disabled>primary</TextButton>
          <TextButton variant="secondary" disabled>secondary</TextButton>
          <TextButton variant="danger" disabled>danger</TextButton>

          <TextButton variant="primary" loading>primary</TextButton>
          <TextButton variant="secondary" loading>secondary</TextButton>
          <TextButton variant="danger" loading>danger</TextButton>
        </div>
      </Section>

      <Section title="icon button">
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, minmax(40px, 56px))' }}>
          <IconButton variant="primary" state="default" icon="moon" label="primary" />
          <IconButton variant="secondary" state="default" icon="moon" label="secondary" />
          <IconButton variant="danger" state="default" icon="moon" label="danger" />

          <IconButton variant="primary" state="hovered" icon="moon" label="primary" />
          <IconButton variant="secondary" state="hovered" icon="moon" label="secondary" />
          <IconButton variant="danger" state="hovered" icon="moon" label="danger" />

          <IconButton variant="primary" state="pressed" icon="moon" label="primary" />
          <IconButton variant="secondary" state="pressed" icon="moon" label="secondary" />
          <IconButton variant="danger" state="pressed" icon="moon" label="danger" />

          <IconButton variant="primary" icon="moon" label="primary" disabled />
          <IconButton variant="secondary" icon="moon" label="secondary" disabled />
          <IconButton variant="danger" icon="moon" label="danger" disabled />

          <IconButton variant="primary" icon="moon" label="primary" loading />
          <IconButton variant="secondary" icon="moon" label="secondary" loading />
          <IconButton variant="danger" icon="moon" label="danger" loading />
        </div>
      </Section>

      <Section title="inputs">
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))' }}>
          <Input label="email" placeholder="ivan@example.com" required state="default" />
          <Input label="email" placeholder="ivan@example.com" required state="hovered" />
          <Input label="email" value="ivan@example.com" required state="focused" />
          <Input label="email" placeholder="ivan@example.com" required state="disabled" disabled />

          <Input label="email" placeholder="ivan@example.com" required error state="default" />
          <Input label="email" placeholder="ivan@example.com" required error state="hovered" />
          <Input label="email" value="ivan@example.com" required error state="focused" />
          <Input label="email" placeholder="ivan@example.com" required error state="disabled" disabled />

          <Input label="email" value="ivan@example.com" required state="default" />
          <Input label="email" value="ivan@example.com" required state="hovered" />
          <Input label="email" value="ivan@example.com" required state="focused" />
          <Input label="email" value="ivan@example.com" required state="disabled" disabled />

          <Input label="email" value="ivan@example.com" required error state="default" caption="!поле обязательно для заполнения" />
          <Input label="email" value="ivan@example.com" required error state="hovered" caption="!поле обязательно для заполнения" />
          <Input label="email" value="ivan@example.com" required error state="focused" caption="!поле обязательно для заполнения" />
          <Input label="email" value="ivan@example.com" required error state="disabled" disabled caption="!поле обязательно для заполнения" />
        </div>
      </Section>

      <Section title="choice card">
        <div className="grid gap-3">
          <ChoiceCard title="text" icon="fitness" state="default" />
          <ChoiceCard title="text" icon="fitness" state="hovered" />
          <ChoiceCard title="text" icon="fitness" state="selected" />
        </div>
      </Section>

      <Section title="select card">
        <div className="grid gap-3">
          <SelectCard title="text" icon="fitness" state="default" />
          <SelectCard title="text" icon="fitness" state="hovered" />
          <SelectCard title="text" icon="fitness" state="selected" />
        </div>
      </Section>

      <Section title="radio button">
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(6, max-content)' }}>
          <RadioButton state="default" />
          <RadioButton state="hovered" />
          <RadioButton state="pressed" />
          <RadioButton active state="default" />
          <RadioButton active state="hovered" />
          <RadioButton active state="pressed" />
        </div>
      </Section>

      <Section title="loader">
        <div className="flex flex-wrap items-center gap-6">
          <div className="inline-flex items-center gap-2 text-[var(--size-14)] leading-[var(--line-height-22)]">
            <Loader size={16} />
            loader / 16
          </div>
          <div className="inline-flex items-center gap-2 text-[var(--size-14)] leading-[var(--line-height-22)]">
            <Loader size={20} />
            loader / 20
          </div>
        </div>
      </Section>

      <Section title="tab">
        <div className="grid gap-6">
          <div
            className="inline-flex w-fit"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border-primary-default)',
            }}
          >
            <Tab label="Workout" icon="fitness" active />
            <Tab label="Leaderboard" icon="trophy" />
            <Tab label="Settings" icon="settings" />
            <Tab label="Profile" icon="person" />
          </div>

          <div
            className="inline-flex w-fit"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border-primary-default)',
            }}
          >
            <Tab label="Workout" icon="fitness" active platform="mobile" />
            <Tab label="Leaderboard" icon="trophy" platform="mobile" />
            <Tab label="Settings" icon="settings" platform="mobile" />
            <Tab label="Profile" icon="person" platform="mobile" />
          </div>
        </div>
      </Section>
    </div>
  )
}
