import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { ChevronRight, Flame, Moon, type LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { formatHourLabel, minutesToTime, timeToMinutes } from '../../lib/util/time';

const ITEM_HEIGHT = 40;
const VISIBLE_ROWS = 5; // odd so there's a clear center

type Tint = 'coral' | 'sage';

type Props = {
  label: string;
  value: string; // 'HH:MM'
  onChange: (next: string) => void;
  tint: Tint;
};

export function TimePickerRow({ label, value, onChange, tint }: Props) {
  const { palette, mode } = useTheme();
  const [open, setOpen] = useState(false);

  const tintBg = tint === 'coral' ? palette.coralSoft : palette.sageSoft;
  const tintDeep = tint === 'coral' ? palette.coralDeep : palette.sageDeep;
  const Icon: LucideIcon = tint === 'coral' ? Flame : Moon;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center rounded-card"
        style={{
          gap: 14,
          paddingHorizontal: 18,
          paddingVertical: 16,
          marginBottom: 12,
          backgroundColor: mode === 'dark' ? palette.ivory : '#FFFFFF',
          borderColor: mode === 'dark' ? palette.sand : palette.coralWhisper,
          borderWidth: 1,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: tintBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={18} color={tintDeep} />
        </View>
        <View className="flex-1">
          <Text className="font-sans-semibold text-ink-soft text-xs">{label}</Text>
          <Text
            className="text-espresso"
            style={{
              fontFamily: 'Fraunces_500Medium',
              fontSize: 22,
              marginTop: 2,
            }}
          >
            {formatHourLabel(value)}
          </Text>
        </View>
        <ChevronRight size={18} color={palette.stone} />
      </Pressable>

      <TimePickerModal
        open={open}
        value={value}
        label={label}
        onClose={() => setOpen(false)}
        onConfirm={(next) => {
          onChange(next);
          setOpen(false);
        }}
      />
    </>
  );
}

type ModalProps = {
  open: boolean;
  value: string;
  label: string;
  onClose: () => void;
  onConfirm: (next: string) => void;
};

function TimePickerModal({ open, value, label, onClose, onConfirm }: ModalProps) {
  const { palette, mode } = useTheme();
  const minutes = timeToMinutes(value);
  const initialHour = Math.floor(minutes / 60);
  const initialMin = Math.floor((minutes % 60) / 5) * 5;

  const hourIndex = useRef(initialHour);
  const minIndex = useRef(initialMin / 5);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const mins = useMemo(() => Array.from({ length: 12 }, (_, i) => i * 5), []);

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        {/* Backdrop: absolutely-positioned Pressable so it doesn't sit in the
            modal-body's touch-responder chain. Wrapping the body in a Pressable
            (the previous shape) makes Pressable claim the responder and the
            wheel FlatLists below it never receive scroll gestures. */}
        <Pressable
          onPress={onClose}
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(58,46,37,0.4)' }]}
        />
        <View
          style={{
            backgroundColor: mode === 'dark' ? palette.ivory : '#FFFFFF',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 32,
          }}
        >
          <Text
            className="text-espresso"
            style={{ fontFamily: 'Fraunces_500Medium', fontSize: 22, textAlign: 'center' }}
          >
            {label}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              height: ITEM_HEIGHT * VISIBLE_ROWS,
              marginTop: 16,
              position: 'relative',
            }}
          >
            <Wheel
              data={hours}
              initialIndex={initialHour}
              onIndexChange={(idx) => {
                hourIndex.current = idx;
              }}
              render={(n) => String(n).padStart(2, '0')}
            />
            <View style={{ justifyContent: 'center', paddingHorizontal: 4 }}>
              <Text
                className="text-espresso"
                style={{ fontFamily: 'Fraunces_500Medium', fontSize: 28 }}
              >
                :
              </Text>
            </View>
            <Wheel
              data={mins}
              initialIndex={initialMin / 5}
              onIndexChange={(idx) => {
                minIndex.current = idx;
              }}
              render={(n) => String(n).padStart(2, '0')}
            />

            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: ITEM_HEIGHT * 2,
                height: ITEM_HEIGHT,
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderColor: palette.coralSoft,
              }}
            />
          </View>

          <View className="flex-row" style={{ gap: 12, marginTop: 24 }}>
            <Pressable
              onPress={onClose}
              className="flex-1 items-center justify-center rounded-full"
              style={{
                height: 48,
                borderWidth: 1,
                borderColor: palette.sand,
              }}
            >
              <Text className="font-sans-semibold text-ink-soft">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                const total = hourIndex.current * 60 + minIndex.current * 5;
                onConfirm(minutesToTime(total));
              }}
              className="flex-1 items-center justify-center rounded-full bg-coral"
              style={{ height: 48 }}
            >
              <Text className="font-sans-semibold text-cream">Set time</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Wheel<T extends number>({
  data,
  initialIndex,
  onIndexChange,
  render,
}: {
  data: T[];
  initialIndex: number;
  onIndexChange: (index: number) => void;
  render: (item: T) => string;
}) {
  const { palette } = useTheme();
  const padding = Array.from({ length: 2 }, () => null);

  const handleEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / ITEM_HEIGHT);
    onIndexChange(Math.max(0, Math.min(data.length - 1, idx)));
  };

  return (
    <FlatList
      style={{ flex: 1 }}
      data={[...padding, ...data, ...padding]}
      keyExtractor={(_, i) => String(i)}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      getItemLayout={(_, i) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * i, index: i })}
      initialScrollIndex={initialIndex}
      onMomentumScrollEnd={handleEnd}
      renderItem={({ item }) => (
        <View
          style={{
            height: ITEM_HEIGHT,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item === null ? null : (
            <Text
              style={{
                fontFamily: 'Fraunces_500Medium',
                fontSize: 24,
                color: palette.espresso,
              }}
            >
              {render(item)}
            </Text>
          )}
        </View>
      )}
    />
  );
}
