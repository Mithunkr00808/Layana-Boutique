import React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
  Hr,
  Heading,
  Preview,
  Tailwind,
  Row,
  Column,
  Img,
} from "@react-email/components";

interface OrderConfirmationEmailProps {
  orderId: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
    size?: string;
    image?: string;
  }>;
  shippingAddress: {
    fullName?: string;
    phone?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  totalAmount: string;
}

export const OrderConfirmationEmail = ({
  orderId,
  customerName,
  items,
  shippingAddress,
  totalAmount,
}: OrderConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Layana Boutique order #{orderId.slice(-6).toUpperCase()} is confirmed!</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[600px]">
            <Section className="mt-[32px]">
              <Text className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0 font-serif">
                Layana Boutique
              </Text>
            </Section>

            <Heading className="text-black text-[20px] font-normal text-center p-0 my-[30px] mx-0">
              Thank you for your order, {customerName}!
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">
              We've received your order and are currently processing it. We will notify you again once your items have shipped.
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Section>
              <Text className="text-[#666666] text-[12px] uppercase font-bold tracking-wider mb-4">
                Order details (Order #{orderId.slice(-6).toUpperCase()})
              </Text>

              {items.map((item, index) => (
                <Row key={index} className="mb-4">
                  <Column className="w-[15%] align-top">
                    {item.image && (
                      <Img 
                        src={item.image} 
                        alt={item.name} 
                        width="64" 
                        height="64" 
                        className="rounded-md object-cover border border-solid border-[#eaeaea]"
                      />
                    )}
                  </Column>
                  <Column className="w-[10%] align-top pl-4">
                    <Text className="text-black text-[14px] m-0 mt-1">x{item.quantity}</Text>
                  </Column>
                  <Column className="w-[50%] align-top">
                    <Text className="text-black text-[14px] m-0 mt-1 font-medium">{item.name}</Text>
                    {item.size && (
                      <Text className="text-[#666666] text-[12px] m-0 mt-1">Size: {item.size}</Text>
                    )}
                  </Column>
                  <Column className="w-[25%] align-top text-right">
                    <Text className="text-black text-[14px] m-0 mt-1">{item.price}</Text>
                  </Column>
                </Row>
              ))}

              <Row className="mt-6 border-t border-solid border-[#eaeaea] pt-4">
                <Column className="w-[70%]">
                  <Text className="text-black text-[14px] font-bold m-0">Total</Text>
                </Column>
                <Column className="w-[30%] text-right">
                  <Text className="text-black text-[14px] font-bold m-0">{totalAmount}</Text>
                </Column>
              </Row>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Section>
              <Text className="text-[#666666] text-[12px] uppercase font-bold tracking-wider mb-4">
                Shipping Address
              </Text>
              <Text className="text-black text-[14px] leading-[20px] m-0 font-medium">
                {shippingAddress.fullName}
              </Text>
              <Text className="text-[#666666] text-[14px] leading-[20px] m-0 mt-1">
                {shippingAddress.streetAddress}
                <br />
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                <br />
                Phone: {shippingAddress.phone}
              </Text>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you have any questions regarding your order, please reply to this email or contact us at support@layanaboutique.com.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderConfirmationEmail;
