import { ColorPicker, Button, Space } from 'antd';
import type { ColorPickerProps } from 'antd'; // , GetProp
import { AggregationColor } from 'antd/es/color-picker/color';
import { FaCrosshairs } from 'react-icons/fa';
import { useEyeDropper } from '@/hooks/useEyeDropper';

type ColorPickerChange = NonNullable<ColorPickerProps['onChange']>;

export interface InputColorProps extends Omit<ColorPickerProps, 'onChange'> {
  onChange?: ColorPickerChange;
  showEyeDropper?: boolean;
}

export const InputColor = ({
  showText = true,
  showEyeDropper = true,
  disabled,
  onChange,
  ...colorPickerProps
}: InputColorProps) => {
  const { supported, open } = useEyeDropper();

  const pickColor = async () => {
    try {
      const result = await open();
      if (!result) return;

      const { sRGBHex } = result;
      onChange?.(new AggregationColor(sRGBHex), sRGBHex);
    } catch {
      // AbortError on cancel, or unsupported — ignore
    }
  };

  const picker = (
    <ColorPicker
      showText={showText}
      disabled={disabled}
      onChange={onChange}
      {...colorPickerProps}
    />
  );

  if (supported && showEyeDropper) {
    return (
      <Space.Compact>
        {picker}

        <Button
          tabIndex={-1}
          icon={<FaCrosshairs />}
          disabled={disabled}
          onClick={pickColor}
        />
      </Space.Compact>
    );
  }

  return picker;
}
