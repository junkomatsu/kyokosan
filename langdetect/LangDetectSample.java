import java.util.*;
import java.io.File;
import com.cybozu.labs.langdetect.*;

class LangDetectSample {
  public static void main(String[] args) throws Exception {
    File profileDir = new File("./profiles");
    DetectorFactory.loadProfile(profileDir);
    Detector detector = DetectorFactory.create();
    String text = args[args.length - 1];
    detector.append(text);
    detector.detect();
    ArrayList<Language> langs = detector.getProbabilities();
    for (Iterator<Language> it = langs.iterator(); it.hasNext();) {
      System.out.println(it.next());
    }
  }
}