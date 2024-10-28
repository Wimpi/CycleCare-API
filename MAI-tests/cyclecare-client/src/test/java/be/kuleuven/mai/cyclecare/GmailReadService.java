package be.kuleuven.mai.cyclecare;

import jakarta.mail.Address;
import jakarta.mail.FetchProfile;
import jakarta.mail.Folder;
import jakarta.mail.Header;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Multipart;
import jakarta.mail.Part;
import jakarta.mail.Session;
import jakarta.mail.Store;
import jakarta.mail.UIDFolder.FetchProfileItem;
import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.search.AndTerm;
import jakarta.mail.search.ComparisonTerm;
import jakarta.mail.search.ReceivedDateTerm;
import jakarta.mail.search.RecipientTerm;
import jakarta.mail.search.SearchTerm;
import jakarta.mail.search.SubjectTerm;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Date;
import java.util.Enumeration;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

/**
 * This service can be used to extract reset tokens from emails sent to a gmail account.
 */
@Service
public class GmailReadService {

    private final GmailReadServiceConfig gmailReadServiceConfig;

    public GmailReadService(GmailReadServiceConfig gmailReadServiceConfig) {
        this.gmailReadServiceConfig = gmailReadServiceConfig;
    }

    public String[] readResetcodesFromGmail(String toEmail) {
        Store store = null;
        Folder folder = null;

        try {
            store = getImapStore();
            folder = getFolderFromStore(store, "INBOX");

            Message[] messages = folder.search(getMessagesSearchTerm(toEmail));
            folder.fetch(messages, getFetchProfile());

            if (messages.length == 0) {
                System.out.println("No messages found");
                return null;
            } else if (messages.length > 1) {
                System.out.println("Multiple messages found");
            }

            return Stream.of(messages).map(this::extractResetCode).toArray(String[]::new);

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            closeFolder(folder);
            closeStore(store);
        }
        return null;
    }

    private Store getImapStore() throws Exception {
        Session session = Session.getInstance(getImapProperties());
        Store store = session.getStore("imaps");
        store.connect("imap.gmail.com", gmailReadServiceConfig.getEmail(), gmailReadServiceConfig.getAppPassword());
        return store;
    }

    private Properties getImapProperties() {
        Properties props = new Properties();
        props.put("mail.imaps.host", "imap.gmail.com");
        props.put("mail.imaps.ssl.trust", "imap.gmail.com");
        props.put("mail.imaps.port", "993");
        props.put("mail.imaps.starttls.enable", "true");
        props.put("mail.imaps.connectiontimeout", "10000");
        props.put("mail.imaps.timeout", "10000");
        return props;
    }

    private Folder getFolderFromStore(Store store, String folderName) throws MessagingException {
        Folder folder = store.getFolder(folderName);
        folder.open(Folder.READ_ONLY);
        return folder;
    }

    private SearchTerm getMessagesSearchTerm(String toEmail) throws AddressException {
        final RecipientTerm receiverIs = new RecipientTerm(Message.RecipientType.TO, new InternetAddress(toEmail));
        final SubjectTerm subjectIsPasswordResetRequest = new SubjectTerm("Password Reset Request");
        final ReceivedDateTerm receivedLessThanTenMinutesAgo = new ReceivedDateTerm(ComparisonTerm.GE, new Date(new Date().getTime() - (1000 * 60 * 10)));
        return new AndTerm(new SearchTerm[] {
            receiverIs,
            subjectIsPasswordResetRequest,
            receivedLessThanTenMinutesAgo
        });
    }

    private FetchProfile getFetchProfile() {
        FetchProfile fetchProfile = new FetchProfile();
        fetchProfile.add(FetchProfileItem.ENVELOPE);
        fetchProfile.add(FetchProfileItem.CONTENT_INFO);
        fetchProfile.add("X-mailer");
        return fetchProfile;
    }

    private String extractResetCode(Message message) {
        StringBuilder bodyBuilder = new StringBuilder();
        try {
            collectTextFromMessage(bodyBuilder, message);
        } catch (MessagingException | IOException e) {
            e.printStackTrace();
        }
        String body = bodyBuilder.toString();
        // extract reset code from body. This is a hexadecimal number of 8 characters (4 bytes) and can be found in the body of the email
        // it is enclosed by a <p id="code">xxxxxxxx</p> tag, e.g. <p id="code">22e09427</p>
        // we use a regex to extract the code
        Pattern p = Pattern.compile("<p id=\"code\">([0-9a-fA-F]{8})<\\/p>.*");
        Matcher matcher = p.matcher(body);
        final String resetCode = matcher.find() ? matcher.group(1) : null;
        return resetCode;
    }

    private void printMessage(Message message) throws MessagingException, IOException {
        StringBuilder messageBuilder = new StringBuilder();
        messageBuilder.append("RECEIVED ON: ").append(message.getReceivedDate()).append("\n");

        Address[] addressesFrom = message.getFrom();
        String from = addressesFrom != null ? ((InternetAddress) addressesFrom[0]).getAddress() : null;
        messageBuilder.append("FROM: ").append(from).append("\n");

        Enumeration<Header> allHeaders = message.getAllHeaders();
        for (Enumeration<Header> e = allHeaders; e.hasMoreElements();) {
            Header h = e.nextElement();
            messageBuilder.append(h.getName()).append(": ").append(h.getValue()).append("\n");
        }


        messageBuilder.append("SUBJECT: ").append(message.getSubject()).append("\n");

        StringBuilder textCollector = new StringBuilder();
        collectTextFromMessage(textCollector, message);
        messageBuilder.append("TEXT: ").append(textCollector.toString()).append("\n");

        System.out.println(messageBuilder.toString());
    }

    private void collectTextFromMessage(StringBuilder textCollector, Part part)
        throws MessagingException, IOException {
        if (part.isMimeType("text/plain") || part.isMimeType("text/html")) {
            textCollector.append((String) part.getContent());
        } else if (part.isMimeType("multipart/*") && part.getContent() instanceof Multipart) {
            Multipart multiPart = (Multipart) part.getContent();
            for (int i = 0; i < multiPart.getCount(); i++) {
                collectTextFromMessage(textCollector, multiPart.getBodyPart(i));
            }
        }
    }

    private void closeFolder(Folder folder) {
        if (folder != null && folder.isOpen()) {
            try {
                folder.close(true);
            } catch (MessagingException e) {
                e.printStackTrace();
            }
        }
    }

    private void closeStore(Store store) {
        if (store != null && store.isConnected()) {
            try {
                store.close();
            } catch (MessagingException e) {
                e.printStackTrace();
            }
        }
    }
}
