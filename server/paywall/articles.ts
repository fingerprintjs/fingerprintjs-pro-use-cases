/**
 * Mock articles "database". In the real world, these articles could be fetched from anywhere.
 * */

export type ArticleData = {
  id: string;
  date: string;
  title: string;
  content: string;
};

export const ARTICLES: ArticleData[] = [
  {
    id: '1',
    date: '1 hour ago',
    title: 'Why Browser Anti-Fingerprinting Techniques Are Not Effective',
    content: `In this article, we will discuss why the existence of privacy-focused browsers doesn’t necessarily affect the effectiveness of fingerprint-based browser identification to prevent online fraud. 

We start with a technical dive into how today’s anti-fingerprinting solutions work, focusing on uniformity and privacy-through-randomization techniques and their specific implementations. We list multiple examples from popular browsers, including one of the more popular privacy-focused browsers, Brave. We then elaborate on why device identification remains a valuable tool to prevent online fraud. Let’s dive right in.`,
  },
  {
    id: '2',
    date: '2 days ago',
    title: 'Five Mistakes You’re Making with Your Login Page Security and How to Fix Them',
    content: `Your login page is a perfect target for hackers because it serves as the primary defense between the internet and sensitive data. Most web applications allow users to log into accounts and view sensitive information. As a result, your login page is the gateway defense between the user’s personally identifiable information (PII) and the open internet. If your login page isn’t secure, you’re likely making these five mistakes.`,
  },
  {
    id: '3',
    date: '1 week ago',
    title: 'Friendly Fraud: What It Is & How to Protect Your Business',
    content: `Friendly fraud may not sound all that threatening, but it accounts for 70% of all credit card fraud and costs the eCommerce industry billions annually.

You’re doing your best to serve and relate to your customers on a human, friendly level. You’re constantly trying to make them happy, anticipate their needs, and improve their lives. You’re doing your best to provide the best customer experience, but not every customer is acting with the best intentions.`,
  },
  {
    id: '4',
    date: '1 month ago',
    title: 'The Basics of Loan Fraud and How To Prevent It',
    content: `The balance between consumer convenience and security is a delicate process, especially in a competitive, high-value market. For example, when banks and credit card companies provide online loan applications, they make it convenient for potential customers to get a loan. Still, they also make it convenient for identity thieves and hackers. `,
  },
];
