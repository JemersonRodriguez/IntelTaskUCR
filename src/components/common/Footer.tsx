import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <p className={styles.text_1}>
                    &copy; {new Date().getFullYear()} IntelTaskPJ. All rights reserved.
                </p>
                <p className={styles.text_2}>
                    Made with ❤️ by the IntelTaskPJ Team
                </p>
            </div>
        </footer>
    );
};

export default Footer;

    