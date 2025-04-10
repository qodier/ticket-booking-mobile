import { ShortcutProps, defaultShortcuts } from "@/styles/shortcuts";
import { TextInput, TextInputProps } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface InputProps extends ShortcutProps, TextInputProps { }

export function Input(props: InputProps) {
  const { theme } = useTheme();
  
  return (
    <TextInput
      style={[defaultShortcuts(props), {
        fontSize: 16,
        borderRadius: 16,
        backgroundColor: theme.lightGray,
        color: theme.text
      }]}
      placeholderTextColor="darkgray"
      {...props}
    />
  );
}
