import {
  Button,
  Html,
  Head,
  Body,
  Container,
  Text,
  Tailwind,
} from "@react-email/components";

export default function VerifyEmail({
  verificationUrl,
  productName,
}: {
  verificationUrl: string;
  productName: string;
}) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-50 font-sans  items-center">
          <Container className="mx-auto max-w-md p-6 bg-white rounded-lg shadow-sm">
            <Text className="text-2xl font-bold text-gray-800 mb-4">
              Verify your Email for {productName}
            </Text>
            <Text className="text-gray-600 mb-6">
              Pls Click on the button below to verify your email address
            </Text>
            <Button
              href={verificationUrl}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg  cursor-pointer"
            >
              Verify email
            </Button>
            <Text className="text-gray-400 text-sm mt-6">
              If you didnt request this, pls ignore this email
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
