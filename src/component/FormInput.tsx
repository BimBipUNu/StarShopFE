import { Form } from "react-bootstrap";

interface FormInputProps {
  ref?: React.Ref<HTMLInputElement> | undefined;
  placeholder?: string;
  content?: string;
  name?: string;
  value?: string | undefined | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | undefined;
  type?: string;
}

function FormInput({
  placeholder,
  content,
  error,
  onChange,
  name,
  value,
  type = "text",
  ref = undefined,
}: FormInputProps) {
  return (
    <Form.Group>
      <Form.Label htmlFor={content}>{content}</Form.Label>
      <Form.Control
        placeholder={placeholder}
        id={content}
        onChange={onChange}
        name={name}
        value={value}
        type={type}
        ref={ref}
        isInvalid={!!error}
      />
      {error && (
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      )}
    </Form.Group>
  );
}

export default FormInput;
